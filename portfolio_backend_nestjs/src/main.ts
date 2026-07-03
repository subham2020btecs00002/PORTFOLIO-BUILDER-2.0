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

  /**
   * In production the monolith should only accept requests from the API Gateway.
   * The CORS origin is set to the gateway URL, not the frontend directly.
   */
  app.enableCors({
    origin: gatewayUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Internal-Secret',
      'X-User-Id',
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
  console.log(`[Monolith] Running on: http://localhost:${port} (internal only)`);
  console.log(`[Monolith] API Gateway expected at: ${gatewayUrl}`);
}
bootstrap();
