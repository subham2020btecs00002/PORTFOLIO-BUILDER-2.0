import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { User, UserSchema } from '../common/schemas/user.schema';

@Module({
  imports: [
    PortfolioModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
