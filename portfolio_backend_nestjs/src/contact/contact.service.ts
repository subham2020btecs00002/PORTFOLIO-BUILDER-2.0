import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL'),
        pass: this.configService.get<string>('PASSWORD'),
      },
    });
  }

  async sendEmail(dto: ContactDto): Promise<void> {
    const { name, email, phone, reason } = dto;
    const receiver = this.configService.get<string>('RECEIVER_EMAIL');

    const mailOptions = {
      from: email,
      to: receiver,
      subject: `${name} wants to contact you`,
      text: `
        Here are the details:
        
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'N/A'}
        Reason: ${reason}
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
