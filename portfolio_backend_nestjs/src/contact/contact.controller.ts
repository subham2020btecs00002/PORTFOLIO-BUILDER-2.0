import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('api')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactEmail(@Body() dto: ContactDto) {
    await this.contactService.sendEmail(dto);
    return 'Email sent successfully';
  }
}
