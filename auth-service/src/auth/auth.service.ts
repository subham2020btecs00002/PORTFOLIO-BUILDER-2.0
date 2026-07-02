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

/**
 * AuthService — migrated verbatim from the monolith.
 *
 * This is the ONLY service that signs JWTs (using JWT_SECRET and
 * JWT_REFRESH_SECRET). The API Gateway only *verifies* tokens — it
 * never signs them.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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
}
