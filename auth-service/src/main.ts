import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const gatewayUrl =
    configService.get<string>('GATEWAY_URL') ?? 'http://localhost:3001';
  const port = configService.get<number>('PORT') ?? 5001;

  app.use(helmet());
  app.use(cookieParser());

  /**
   * CORS restricted to the API Gateway only.
   * The frontend must never talk directly to this service.
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
