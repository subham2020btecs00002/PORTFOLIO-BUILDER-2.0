import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable NestJS body parsing — http-proxy-middleware needs the raw stream
    bodyParser: false,
  });

  // Enable trusting reverse proxy headers from Render & Cloudflare edge
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

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

  // ── Global Exception Filter (standard RFC 7807 problem details) ──────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── CORS — dynamically accept any vercel.app, onrender.com, or localhost origin ──
  const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true;
    if (origin.includes('localhost') || origin.includes('127.0.0.1'))
      return true;
    if (origin.endsWith('.vercel.app') || origin.includes('vercel.app'))
      return true;
    if (origin.endsWith('.onrender.com') || origin.includes('onrender.com'))
      return true;
    if (frontendUrl && origin === frontendUrl) return true;
    return false;
  };

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
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
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Correlation-Id',
    ],
    exposedHeaders: [
      'Set-Cookie',
      'X-Correlation-Id',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
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
