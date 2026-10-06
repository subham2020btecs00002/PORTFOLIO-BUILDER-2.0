import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const configService = app.get(ConfigService);
  const gatewayUrl =
    configService.get<string>('GATEWAY_URL') ?? 'http://localhost:3001';
  const port = configService.get<number>('PORT') ?? 5001;

  app.use(helmet());
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true;
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
    if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) return true;
    if (origin.endsWith('.onrender.com') || origin.includes('onrender.com')) return true;
    if (gatewayUrl && origin === gatewayUrl) return true;
    return false;
  };

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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
      'X-User-Role',
      'X-Correlation-Id',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['X-Correlation-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port);
  console.log(`[Auth Service] Running on: http://localhost:${port} (internal only)`);
  console.log(`[Auth Service] Only accepts requests from: ${gatewayUrl}`);
}
bootstrap();
