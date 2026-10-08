import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';
import { User } from '../common/schemas/user.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly senderEmail: string;
  private readonly senderPass: string;
  private readonly defaultReceiver: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    const rawEmail = this.configService.get<string>('EMAIL') || '';
    const rawPass = this.configService.get<string>('PASSWORD') || '';
    const rawReceiver = this.configService.get<string>('RECEIVER_EMAIL') || '';

    this.senderEmail = rawEmail.trim().replace(/^["']|["']$/g, '');
    this.senderPass = rawPass.trim().replace(/^["']|["']$/g, '');
    this.defaultReceiver = rawReceiver.trim().replace(/^["']|["']$/g, '');

    if (this.senderEmail && this.senderPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: this.senderEmail,
          pass: this.senderPass,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
      this.logger.log(
        `Nodemailer transporter initialized for sender: ${this.senderEmail}`,
      );
    } else {
      this.logger.warn(
        'Nodemailer transporter NOT configured: EMAIL and/or PASSWORD environment variables are missing or empty.',
      );
    }
  }

  async sendEmail(dto: ContactDto): Promise<void> {
    const { name, email, phone, reason, userId } = dto;

    if (!this.transporter) {
      this.logger.error(
        'Cannot send email: SMTP credentials (EMAIL/PASSWORD) are missing on Render.',
      );
      throw new InternalServerErrorException(
        'Email service is not configured. Please ensure EMAIL and PASSWORD (Google App Password) are configured in Render environment variables.',
      );
    }

    // Determine target recipient:
    // If contact is from a specific portfolio, route directly to portfolio owner
    let targetRecipient = this.defaultReceiver || this.senderEmail;
    if (userId) {
      try {
        const owner = await this.userModel.findById(userId).lean();
        if (owner && (owner as any).email) {
          targetRecipient = (owner as any).email;
          this.logger.log(
            `Routing contact email to portfolio owner: ${targetRecipient}`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `Could not resolve user email for userId ${userId}: ${err}`,
        );
      }
    }

    if (!targetRecipient) {
      this.logger.error('No target recipient email available.');
      throw new InternalServerErrorException(
        'No recipient email found for this contact submission.',
      );
    }

    const appUrl = (
      this.configService.get<string>('PORTFOLIO_BUILDER_APP_URL') ||
      this.configService.get<string>('APP_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      process.env.PORTFOLIO_BUILDER_APP_URL ||
      process.env.APP_URL ||
      process.env.FRONTEND_URL ||
      'https://portfolio-builder-2-0-theta.vercel.app/'
    ).trim();

    const mailOptions = {
      from: `"${name} (via PortfolioBuilder)" <${this.senderEmail}>`,
      replyTo: email,
      to: targetRecipient,
      subject: `New Portfolio Contact: ${name}`,
      text: `
You have received a new contact submission from your PortfolioBuilder profile!

Sender Name:  ${name}
Sender Email: ${email}
Phone Number: ${phone || 'Not provided'}

Message:
${reason}

---
Powered by PortfolioBuilder 2.0 (${appUrl})
      `.trim(),
      html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px 28px; color: #ffffff;">
    <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">New Portfolio Inquiry</h2>
    <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px; color: #e0e7ff;">Someone reached out through your public portfolio</p>
  </div>
  <div style="padding: 28px;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 110px; font-weight: 600;">Sender:</td>
        <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
        <td style="padding: 8px 0; color: #4f46e5; font-size: 14px;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Phone:</td>
        <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${phone || 'N/A'}</td>
      </tr>
    </table>
    <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 6px;">
      <h4 style="margin: 0 0 8px; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</h4>
      <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${reason}</p>
    </div>
    <div style="margin-top: 24px; text-align: center;">
      <a href="mailto:${email}?subject=Re: Portfolio Inquiry" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 14px;">
        Reply to ${name}
      </a>
    </div>
  </div>
  <div style="padding: 16px 28px; background: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="margin: 0; font-size: 12px; color: #64748b;">
      Powered by <a href="${appUrl}" style="color: #6366f1; font-weight: 600; text-decoration: none;">PortfolioBuilder 2.0</a>
    </p>
  </div>
</div>
      `.trim(),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Contact email successfully dispatched from ${email} to ${targetRecipient}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send email via SMTP: ${error.message}`,
        error.stack,
      );
      if (error.code === 'EAUTH' || (error.response && error.response.includes('535'))) {
        throw new InternalServerErrorException(
          'SMTP authentication failed. If using Gmail, please verify that you generated a 16-character App Password under Google Account Security.',
        );
      }
      throw new InternalServerErrorException(
        `Error sending email: ${error.message || 'SMTP network failure'}`,
      );
    }
  }
}
