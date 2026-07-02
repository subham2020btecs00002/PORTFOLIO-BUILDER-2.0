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
import { JwtVerifyMiddleware } from './middleware/jwt-verify.middleware';
import { RateLimiterMiddleware } from './middleware/rate-limiter.middleware';

/** Origins that the gateway will accept and forward CORS headers for */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
];

@Module({
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
    const internalSecret = this.configService.get<string>('INTERNAL_SECRET')!;
    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL')!;
    const backendUrl = this.configService.get<string>('BACKEND_URL')!;

    /**
     * Add gateway-specific headers to every upstream request:
     * - X-Internal-Secret: proves request came from gateway
     * - X-User-Id:         injected by JwtVerifyMiddleware after token verification
     */
    const addGatewayHeaders = (proxyReq: any, req: any) => {
      proxyReq.setHeader('x-internal-secret', internalSecret);

      const userId = req.headers['x-user-id'];
      if (userId) {
        proxyReq.setHeader('x-user-id', userId);
      }

      const userRole = req.headers['x-user-role'];
      if (userRole) {
        proxyReq.setHeader('x-user-role', userRole);
      }
    };

    /**
     * Strip CORS headers from the upstream response and rewrite them with the
     * correct browser origin. This is critical because:
     *  - auth-service sets  Access-Control-Allow-Origin: http://localhost:3001 (gateway)
     *  - http-proxy-middleware forwards that header to the browser as-is
     *  - browser rejects it because it doesn't match the actual frontend origin
     *
     * Solution: delete upstream CORS headers and set the correct ones ourselves.
     */
    const rewriteCorsHeaders = (proxyRes: any, req: any) => {
      const browserOrigin: string = req.headers?.origin ?? '';
      const isAllowed = ALLOWED_ORIGINS.includes(browserOrigin);

      // Strip whatever the upstream sent
      delete proxyRes.headers['access-control-allow-origin'];
      delete proxyRes.headers['access-control-allow-credentials'];
      delete proxyRes.headers['access-control-allow-methods'];
      delete proxyRes.headers['access-control-allow-headers'];

      // Set correct values for the actual browser origin
      if (isAllowed) {
        proxyRes.headers['access-control-allow-origin'] = browserOrigin;
        proxyRes.headers['access-control-allow-credentials'] = 'true';
      }
    };

    // ── 1. Rate Limiter ───────────────────────────────────────────────────
    consumer
      .apply(RateLimiterMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // ── 2. JWT Verification ──────────────────────────────────────────────
    consumer
      .apply(JwtVerifyMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // ── 3. Proxy: Auth Service (/api/auth/*) ─────────────────────────────
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
          },
        }),
      )
      .forRoutes({ path: '/api/auth/*path', method: RequestMethod.ALL });

    // ── 4. Proxy: Portfolio & Contact (Monolith) ─────────────────────────
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
          },
        }),
      )
      .forRoutes(
        // Exact base paths (e.g. POST /api/portfolio, PUT /api/portfolio)
        { path: '/api/portfolio', method: RequestMethod.ALL },
        { path: '/api/contact', method: RequestMethod.ALL },
        // Sub-paths (e.g. GET /api/portfolio/exists, GET /api/portfolio/public/:id)
        { path: '/api/portfolio/*path', method: RequestMethod.ALL },
        { path: '/api/contact/*path', method: RequestMethod.ALL },
        { path: '/api/admin/*path', method: RequestMethod.ALL },
      );
  }
}

