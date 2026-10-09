import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../common/schemas/user.schema';
import {
  Portfolio,
  PortfolioSchema,
} from '../portfolio/schemas/portfolio.schema';
import { AiUsage, AiUsageSchema } from '../portfolio/schemas/ai-usage.schema';
import { AuthClientService } from '../common/services/auth-client.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: AiUsage.name, schema: AiUsageSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AuthClientService],
})
export class AdminModule {}
