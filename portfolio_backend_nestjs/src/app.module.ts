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

/**
 * App Module (Monolith — Phase 3)
 *
 * Auth has been extracted into the standalone auth-service (port 5001).
 * This monolith now only handles Portfolio and Contact functionality.
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
   * Apply InternalSecretMiddleware globally.
   * Rejects any request not arriving from the API Gateway.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InternalSecretMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
