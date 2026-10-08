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
      const smtpHost = (
        this.configService.get<string>('SMTP_HOST') ||
        process.env.SMTP_HOST ||
        'smtp.gmail.com'
      ).trim();
      const smtpPort =
        Number(
          this.configService.get<string>('SMTP_PORT') ||
            process.env.SMTP_PORT ||
            465,
        ) || 465;
      const smtpSecure =
        this.configService.get<string>('SMTP_SECURE') !== undefined
          ? this.configService.get<string>('SMTP_SECURE') === 'true'
          : smtpPort === 465;

      this.transporter = nodemailer.createTransport({
        service: smtpHost === 'smtp.gmail.com' ? 'gmail' : undefined,
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: this.senderEmail,
          pass: this.senderPass,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      });
      this.logger.log(
        `Nodemailer transporter initialized for sender: ${this.senderEmail} (${smtpHost}:${smtpPort})`,
      );
    } else {
      this.logger.warn(
        'Nodemailer transporter NOT configured: EMAIL and/or PASSWORD environment variables are missing or empty.',
      );
    }
  }

  private async sendViaResend(
    apiKey: string,
    recipient: string,
    replyToEmail: string,
    replyToName: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const from =
      (
        this.configService.get<string>('RESEND_FROM_EMAIL') ||
        process.env.RESEND_FROM_EMAIL ||
        'PortfolioBuilder <onboarding@resend.dev>'
      ).trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        reply_to: replyToEmail,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.warn(`Resend API error (${response.status}): ${errorBody}`);

      // Handle Resend free tier sandbox restriction:
      // Resend onboarding@resend.dev only allows sending to the registered account email.
      // If the portfolio belongs to another user, deliver to the verified admin email
      // with a clear banner instead of failing with a 500 error!
      const fallbackEmail = this.defaultReceiver || this.senderEmail;
      if (
        response.status === 403 &&
        errorBody.includes('only send testing emails to your own email address') &&
        fallbackEmail &&
        recipient.toLowerCase() !== fallbackEmail.toLowerCase()
      ) {
        this.logger.log(
          `Resend free sandbox limitation: Cannot send to ${recipient}. Rerouting to verified account: ${fallbackEmail}`,
        );

        const sandboxNoticeHtml = `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #92400e;">
            <strong>⚠️ Resend Sandbox Mode Notice:</strong> This message was delivered to admin (<code>${fallbackEmail}</code>) because Resend is in free testing mode.
            <br/><strong>Intended Portfolio Owner:</strong> <code>${recipient}</code>
            <br/><span style="font-size: 11px; color: #b45309;">To deliver directly to individual user emails, verify a custom domain at <a href="https://resend.com/domains" style="color: #b45309;">resend.com/domains</a> or use Brevo (set BREVO_API_KEY in Render).</span>
          </div>
        `;

        const retryResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [fallbackEmail],
            reply_to: replyToEmail,
            subject: `[Portfolio Contact for ${recipient}] ${subject}`,
            text: `[Intended Recipient: ${recipient}]\n\n${text}`,
            html: sandboxNoticeHtml + html,
          }),
        });

        if (retryResponse.ok) {
          const retryResult = (await retryResponse.json().catch(() => ({}))) as any;
          this.logger.log(
            `Email successfully delivered via Resend sandbox fallback (id: ${retryResult.id || 'ok'}) to ${fallbackEmail}`,
          );
          return;
        }
      }

      throw new Error(`Resend API returned ${response.status}: ${errorBody}`);
    }

    const result = (await response.json().catch(() => ({}))) as any;
    this.logger.log(
      `Email dispatched via Resend HTTPS API (id: ${result.id || 'ok'}) to ${recipient}`,
    );
  }

  private async sendViaBrevo(
    apiKey: string,
    recipient: string,
    replyToEmail: string,
    replyToName: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const senderEmail = (
      this.configService.get<string>('BREVO_SENDER_EMAIL') ||
      process.env.BREVO_SENDER_EMAIL ||
      this.senderEmail ||
      'contact@portfoliobuilder.com'
    ).trim();

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'PortfolioBuilder', email: senderEmail },
        to: [{ email: recipient }],
        replyTo: { email: replyToEmail, name: replyToName },
        subject,
        textContent: text,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Brevo API error (${response.status}): ${errorBody}`);
      throw new Error(`Brevo API returned ${response.status}: ${errorBody}`);
    }

    const result = (await response.json().catch(() => ({}))) as any;
    this.logger.log(
      `Email dispatched via Brevo HTTPS API (messageId: ${result.messageId || 'ok'}) to ${recipient}`,
    );
  }

  async sendEmail(dto: ContactDto): Promise<void> {
    const { name, email, phone, reason, userId } = dto;

    const resendApiKey = (
      this.configService.get<string>('RESEND_API_KEY') ||
      process.env.RESEND_API_KEY ||
      ''
    ).trim();

    const brevoApiKey = (
      this.configService.get<string>('BREVO_API_KEY') ||
      process.env.BREVO_API_KEY ||
      ''
    ).trim();

    if (!this.transporter && !resendApiKey && !brevoApiKey) {
      this.logger.error(
        'Cannot send email: Neither RESEND_API_KEY nor SMTP credentials (EMAIL/PASSWORD) are configured.',
      );
      throw new InternalServerErrorException(
        'Email service is not configured. Please add RESEND_API_KEY (from https://resend.com) or EMAIL and PASSWORD in Render environment variables.',
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
      from: `"${name} (via PortfolioBuilder)" <${this.senderEmail || 'notifications@portfoliobuilder.com'}>`,
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

    // Priority 1: Resend HTTPS API (Port 443 — never blocked by Render)
    if (resendApiKey) {
      try {
        await this.sendViaResend(
          resendApiKey,
          targetRecipient,
          email,
          name,
          mailOptions.subject,
          mailOptions.text,
          mailOptions.html,
        );
        return;
      } catch (err: any) {
        this.logger.error(`Resend API dispatch failed: ${err.message}`);
        throw new InternalServerErrorException(
          `Failed to send email via Resend API: ${err.message}`,
        );
      }
    }

    // Priority 2: Brevo HTTPS API (Port 443 — never blocked by Render)
    if (brevoApiKey) {
      try {
        await this.sendViaBrevo(
          brevoApiKey,
          targetRecipient,
          email,
          name,
          mailOptions.subject,
          mailOptions.text,
          mailOptions.html,
        );
        return;
      } catch (err: any) {
        this.logger.error(`Brevo API dispatch failed: ${err.message}`);
        throw new InternalServerErrorException(
          `Failed to send email via Brevo API: ${err.message}`,
        );
      }
    }

    // Priority 3: Fallback to Nodemailer SMTP (for local dev or paid Render instances)
    if (!this.transporter) {
      throw new InternalServerErrorException(
        'Email service is not configured. Please add RESEND_API_KEY (from https://resend.com) or EMAIL and PASSWORD in Render environment variables.',
      );
    }

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
      if (
        error.message?.includes('Connection timeout') ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ESOCKET'
      ) {
        throw new InternalServerErrorException(
          "SMTP Connection Timeout: Render's Free Tier blocks outbound SMTP traffic (ports 25, 465, 587). To send emails from Render without port restrictions, add RESEND_API_KEY (from https://resend.com) to your Render environment variables to send over HTTPS (port 443), or upgrade to a paid Render plan.",
        );
      }
      if (
        error.code === 'EAUTH' ||
        (error.response && error.response.includes('535'))
      ) {
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
