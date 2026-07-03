import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { User } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

/**
 * AuthService — migrated verbatim from the monolith.
 *
 * This is the ONLY service that signs JWTs (using JWT_SECRET and
 * JWT_REFRESH_SECRET). The API Gateway only *verifies* tokens — it
 * never signs them.
 */
@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL'),
        pass: this.configService.get<string>('PASSWORD'),
      },
    });
  }

  private issueTokens(userId: string, role: string = 'user'): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProd =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { name, email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this.userModel({ name, email, password: hashedPassword });
    await user.save();

    return { message: 'Registration successful' };
  }

  async login(
    loginDto: LoginDto,
    res: Response,
  ): Promise<{
    user: {
      id: string;
      _id: string;
      name: string;
      email: string;
      username?: string;
      role?: string;
    };
  }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.issueTokens(user.id, user.role);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    this.setAuthCookies(res, accessToken, refreshToken);
    return {
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async refresh(
    rawRefreshToken: string,
    res: Response,
  ): Promise<{ refreshed: boolean }> {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(rawRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const tokenMatches = await bcrypt.compare(
      rawRefreshToken,
      user.refreshTokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const { accessToken, refreshToken: newRefreshToken } = this.issueTokens(
      user.id,
      user.role,
    );
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    this.setAuthCookies(res, accessToken, newRefreshToken);
    return { refreshed: true };
  }

  async logout(userId: string, res: Response): Promise<{ message: string }> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshTokenHash: null,
    });

    const isProd =
      this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/auth',
    });

    return { message: 'Logged out successfully' };
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshTokenHash');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async updateUsername(userId: string, username: string): Promise<User> {
    const trimmedUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      throw new BadRequestException(
        'Username can only contain alphanumeric characters, underscores, and hyphens',
      );
    }

    const existingUser = await this.userModel.findOne({
      username: trimmedUsername,
    });
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Username is already taken');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.username = trimmedUsername;
    await user.save();
    return this.getUser(userId);
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.userModel.findOne({ email });

    // For security reasons, don't disclose if the user exists or not.
    // Always return the success message.
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600000); // 1 hour

      user.resetPasswordToken = token;
      user.resetPasswordExpires = expiry;
      await user.save();

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      const mailOptions = {
        from: this.configService.get<string>('EMAIL'),
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You requested a password reset for your portfolio account. Click the button below to set a new password. This link will expire in 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 0.9em;">If you did not request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 0.8em; text-align: center;">This is an automated message, please do not reply.</p>
          </div>
        `,
      };

      try {
        await this.transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Error sending reset email:', error);
      }
    }

    return {
      message:
        'If a matching account exists, a password reset link has been sent to your email.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokenHash = undefined; // log out from other devices/sessions
    await user.save();

    return { message: 'Password has been reset successfully' };
  }
}
