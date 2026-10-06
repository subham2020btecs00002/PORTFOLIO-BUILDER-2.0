import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const gatewayUrl = configService.get<string>('GATEWAY_URL') || 'http://localhost:3001';
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'self'", frontendUrl, 'http://localhost:3000'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
    if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) return true;
    if (origin.endsWith('.onrender.com') || origin.includes('onrender.com')) return true;
    if (gatewayUrl && origin === gatewayUrl) return true;
    if (frontendUrl && origin === frontendUrl) return true;
    return false;
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Internal-Secret',
      'X-User-Id',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = configService.get<number>('PORT') || 5000;

  await app.listen(port);
  console.log(`[Monolith] Running HTTP on: http://localhost:${port} (internal only)`);
  console.log(`[Monolith] API Gateway expected at: ${gatewayUrl}`);
}
bootstrap();
