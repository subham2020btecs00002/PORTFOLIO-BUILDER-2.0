import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ContactModule } from './contact/contact.module';
import { AdminModule } from './admin/admin.module';
import { InternalSecretMiddleware } from './common/middleware/internal-secret.middleware';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

/**
 * App Module (Monolith — Phase 3)
 *
 * Auth has been extracted into the standalone auth-service (port 5001).
 * This monolith now handles Portfolio, Contact, and Admin functionality.
 * JWT verification and rate limiting are handled by the API Gateway (port 3001).
 * All requests must arrive via the gateway (X-Internal-Secret enforced).
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(5000),
        MONGO_URI: Joi.string().required(),
        INTERNAL_SECRET: Joi.string().required(),
        GATEWAY_URL: Joi.string().default('http://localhost:3001'),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        EMAIL: Joi.string().optional(),
        PASSWORD: Joi.string().optional(),
        RECEIVER_EMAIL: Joi.string().optional(),
        PORTFOLIO_BUILDER_APP_URL: Joi.string().default('https://portfolio-builder-2-0-theta.vercel.app/'),
        APP_URL: Joi.string().optional(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    PortfolioModule,
    ContactModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  /**
   * 1. CorrelationIdMiddleware: captures X-Correlation-Id for distributed tracing.
   * 2. InternalSecretMiddleware: blocks direct external requests (permits / and /health).
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer
      .apply(InternalSecretMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
