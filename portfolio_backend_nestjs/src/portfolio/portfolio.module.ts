import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
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
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}

