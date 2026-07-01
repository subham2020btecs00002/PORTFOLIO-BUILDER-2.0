import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';
import { PortfolioService } from '../portfolio/portfolio.service';

@Controller('api')
export class ContactController {
  constructor(
    private contactService: ContactService,
    private portfolioService: PortfolioService,
  ) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactEmail(@Body() dto: ContactDto) {
    await this.contactService.sendEmail(dto);
    if (dto.userId) {
      try {
        await this.portfolioService.incrementContactCount(dto.userId);
      } catch (err) {
        console.error('Error incrementing contact count:', err);
      }
    }
    return 'Email sent successfully';
  }
}
