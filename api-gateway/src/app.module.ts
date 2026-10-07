import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { AppController } from './app.controller';
import { JwtVerifyMiddleware } from './middleware/jwt-verify.middleware';
import { RateLimiterMiddleware } from './middleware/rate-limiter.middleware';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';

@Module({
  controllers: [AppController],
  imports: [
    // ── Config ──────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3001),
        JWT_SECRET: Joi.string().required(),
        INTERNAL_SECRET: Joi.string().required(),
        AUTH_SERVICE_URL: Joi.string().default('http://localhost:5001'),
        BACKEND_URL: Joi.string().default('http://localhost:5000'),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
    }),

    // ── JWT (verification only — the gateway never signs tokens) ────────────
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET'),
        // No signOptions — the gateway does NOT sign tokens
      }),
    }),
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer): void {
    const rawSecret = this.configService.get<string>('INTERNAL_SECRET') || process.env.INTERNAL_SECRET;
    const internalSecret = String(rawSecret || '').trim().replace(/^["']|["']$/g, '');
    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL')!;
    const backendUrl = this.configService.get<string>('BACKEND_URL')!;

    /**
     * Add gateway-specific headers to every upstream request:
     * - X-Internal-Secret:  proves request came from gateway
     * - X-Correlation-Id:    distributed tracing ID
     * - X-User-Id:          injected by JwtVerifyMiddleware after token verification
     * - X-User-Role:        injected role claim
     */
    const addGatewayHeaders = (proxyReq: any, req: any) => {
      proxyReq.setHeader('x-internal-secret', internalSecret);

      const correlationId = req.headers['x-correlation-id'];
      if (correlationId) {
        proxyReq.setHeader('x-correlation-id', correlationId);
      }

      const userId = req.headers['x-user-id'];
      if (userId) {
        proxyReq.setHeader('x-user-id', userId);
      }

      const userRole = req.headers['x-user-role'];
      if (userRole) {
        proxyReq.setHeader('x-user-role', userRole);
      }
    };

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const isAllowedOrigin = (origin: string | undefined): boolean => {
      if (!origin) return true;
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
      if (origin.endsWith('.vercel.app') || origin.includes('vercel.app')) return true;
      if (origin.endsWith('.onrender.com') || origin.includes('onrender.com')) return true;
      if (frontendUrl && origin === frontendUrl) return true;
      return false;
    };

    /**
     * Strip CORS headers from upstream response and rewrite them for the browser origin.
     */
    const rewriteCorsHeaders = (proxyRes: any, req: any) => {
      const browserOrigin: string = req.headers?.origin ?? '';
      const isAllowed = isAllowedOrigin(browserOrigin);

      delete proxyRes.headers['access-control-allow-origin'];
      delete proxyRes.headers['access-control-allow-credentials'];
      delete proxyRes.headers['access-control-allow-methods'];
      delete proxyRes.headers['access-control-allow-headers'];

      if (isAllowed) {
        proxyRes.headers['access-control-allow-origin'] = browserOrigin;
        proxyRes.headers['access-control-allow-credentials'] = 'true';
      }
    };

    const handleProxyError = (targetName: string) => (err: any, req: any, res: any) => {
      const correlationId = req.headers?.['x-correlation-id'] || '';
      console.error(
        `[API Gateway][ProxyError] Upstream error talking to ${targetName}: ${err.message} [correlationId: ${correlationId}]`,
      );
      if (!res.headersSent && typeof res.writeHead === 'function') {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            statusCode: 502,
            error: 'Bad Gateway',
            message: `Service temporarily unavailable. Please try again.`,
            correlationId,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    };

    // ── 1. Distributed Tracing: Injects X-Correlation-Id ──────────────────
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // ── 2. Request Logger (suppresses /health noise) ──────────────────────
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // ── 3. Rate Limiter (exempts /health & /) ──────────────────────────────
    consumer
      .apply(RateLimiterMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // ── 4. JWT Verification ──────────────────────────────────────────────
    consumer
      .apply(JwtVerifyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // ── 5. Proxy: Auth Service (/api/auth/*) ─────────────────────────────
    consumer
      .apply(
        createProxyMiddleware({
          target: authServiceUrl,
          changeOrigin: true,
          on: {
            proxyReq: (proxyReq, req) => {
              addGatewayHeaders(proxyReq, req);
              fixRequestBody(proxyReq, req as any);
            },
            proxyRes: (proxyRes, req) => {
              rewriteCorsHeaders(proxyRes, req);
            },
            error: handleProxyError('Auth Service'),
          },
        }),
      )
      .forRoutes({ path: '/api/auth/*path', method: RequestMethod.ALL });

    // ── 6. Proxy: Portfolio & Contact (Monolith) ─────────────────────────
    consumer
      .apply(
        createProxyMiddleware({
          target: backendUrl,
          changeOrigin: true,
          on: {
            proxyReq: (proxyReq, req) => {
              addGatewayHeaders(proxyReq, req);
              fixRequestBody(proxyReq, req as any);
            },
            proxyRes: (proxyRes, req) => {
              rewriteCorsHeaders(proxyRes, req);
            },
            error: handleProxyError('Portfolio Monolith'),
          },
        }),
      )
      .forRoutes(
        // Exact base paths
        { path: '/api/portfolio', method: RequestMethod.ALL },
        { path: '/api/contact', method: RequestMethod.ALL },
        // Sub-paths
        { path: '/api/portfolio/*path', method: RequestMethod.ALL },
        { path: '/api/contact/*path', method: RequestMethod.ALL },
        { path: '/api/admin/*path', method: RequestMethod.ALL },
      );
  }
}

