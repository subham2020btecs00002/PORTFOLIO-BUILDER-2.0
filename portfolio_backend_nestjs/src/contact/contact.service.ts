import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactDto } from './dto/contact.dto';
import { User } from '../common/schemas/user.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly senderEmail: string;
  private readonly defaultReceiver: string;
  private readonly brevoApiKey: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    const rawEmail = this.configService.get<string>('EMAIL') || '';
    const rawReceiver = this.configService.get<string>('RECEIVER_EMAIL') || '';
    const rawKey =
      this.configService.get<string>('BREVO_API_KEY') ||
      process.env.BREVO_API_KEY ||
      '';

    this.senderEmail =
      rawEmail.trim().replace(/^["']|["']$/g, '') ||
      'subhamkumar22082001@gmail.com';
    this.defaultReceiver =
      rawReceiver.trim().replace(/^["']|["']$/g, '') ||
      'subhamkumar22082001@gmail.com';
    this.brevoApiKey = rawKey.trim().replace(/^["']|["']$/g, '');

    this.logger.log(
      `ContactService initialized with Brevo HTTPS API for ${this.senderEmail}`,
    );
  }

  async sendEmail(dto: ContactDto): Promise<void> {
    const { name, email, phone, reason, userId } = dto;

    if (!this.brevoApiKey) {
      throw new InternalServerErrorException(
        'Email service is not configured. BREVO_API_KEY is missing.',
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

    const subject = `New Portfolio Contact: ${name}`;
    const textContent = `
You have received a new contact submission from your PortfolioBuilder profile!

Sender Name:  ${name}
Sender Email: ${email}
Phone Number: ${phone || 'Not provided'}

Message:
${reason}

---
Powered by PortfolioBuilder 2.0 (${appUrl})
    `.trim();

    const htmlContent = `
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
    `.trim();

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'PortfolioBuilder', email: this.senderEmail },
          to: [{ email: targetRecipient }],
          replyTo: { email: email, name: name },
          subject,
          textContent,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Brevo API error (${response.status}): ${errorBody}`);

        if (
          errorBody.includes('unrecognised IP address') ||
          errorBody.includes('authorised_ips')
        ) {
          throw new InternalServerErrorException(
            'Brevo IP protection enabled: Please open https://app.brevo.com/security/authorised_ips in your browser and authorize the IP or disable Authorized IPs restrictions.',
          );
        }

        throw new InternalServerErrorException(
          `Failed to send email via Brevo API (${response.status}): ${errorBody}`,
        );
      }

      const result = (await response.json().catch(() => ({}))) as any;
      this.logger.log(
        `Contact email successfully dispatched via Brevo HTTPS API (id: ${result.messageId || 'ok'}) to ${targetRecipient}`,
      );
    } catch (err: any) {
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      this.logger.error(
        `Error sending email via Brevo: ${err.message}`,
        err.stack,
      );
      throw new InternalServerErrorException(
        `Error sending email: ${err.message || 'Brevo API connection failure'}`,
      );
    }
  }
}
