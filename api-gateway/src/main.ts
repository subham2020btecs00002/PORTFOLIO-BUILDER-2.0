import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable NestJS body parsing — http-proxy-middleware needs the raw stream
    bodyParser: false,
  });

  const configService = app.get(ConfigService);
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  const port = configService.get<number>('PORT') ?? 3001;

  // ── Security headers ─────────────────────────────────────────────────────
  app.use(
    helmet({
      // Relax CSP for API gateway (no HTML served)
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ── Cookie parsing (needed to extract access_token cookie) ───────────────
  app.use(cookieParser());

  // ── CORS — gateway is the only origin the frontend talks to ─────────────
  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(port);

  console.log(`[API Gateway] Running on: http://localhost:${port}`);
  console.log(`[API Gateway] Accepting requests from: ${frontendUrl}`);
  console.log(
    `[API Gateway] Auth Service: ${configService.get('AUTH_SERVICE_URL')}`,
  );
  console.log(
    `[API Gateway] Backend:      ${configService.get('BACKEND_URL')}`,
  );
}
bootstrap();
