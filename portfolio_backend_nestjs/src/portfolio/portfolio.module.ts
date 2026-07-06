import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { AiStreamService } from './ai-stream.service';
import { Portfolio, PortfolioSchema } from './schemas/portfolio.schema';
import { User, UserSchema } from '../common/schemas/user.schema';

/**
 * Portfolio Module (Phase 3)
 *
 * AuthModule dependency removed — JWT validation is handled by the API Gateway.
 * User identity arrives via the X-User-Id header set by the gateway.
 *
 * The User schema is registered here as read-only so that:
 *  - .populate('user', 'name username') works on public portfolio queries
 *  - getPublicByUsername() can resolve username → userId
 * Auth-service remains the sole writer of the users collection.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ClientsModule.register([
      {
        name: 'ML_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'portfolio_ml_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, AiStreamService],
  exports: [PortfolioService, AiStreamService],
})
export class PortfolioModule {}

