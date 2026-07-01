import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [PortfolioModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
