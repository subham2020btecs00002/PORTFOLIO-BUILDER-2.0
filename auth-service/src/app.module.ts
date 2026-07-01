import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { InternalSecretMiddleware } from './common/middleware/internal-secret.middleware';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(5001),
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        INTERNAL_SECRET: Joi.string().required(),
        FRONTEND_URL: Joi.string().default('http://localhost:3000'),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        EMAIL: Joi.string().optional(),
        PASSWORD: Joi.string().optional(),
        RECEIVER_EMAIL: Joi.string().optional(),
      }),
    }),

    // ── MongoDB ──────────────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    AuthModule,
  ],
})
export class AppModule {
  /**
   * Protect all auth-service routes with the internal secret middleware.
   * Only the API Gateway (which sets X-Internal-Secret) can reach this service.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InternalSecretMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
