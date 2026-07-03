import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from './decorators/current-user.decorator';

/**
 * Auth Controller — migrated from monolith.
 *
 * Key changes from the monolith version:
 *  - ThrottlerGuard removed (rate limiting is now in the API Gateway)
 *  - @Throttle decorators removed (gateway enforces rate limits centrally)
 *
 * JWT guards (@UseGuards(AuthGuard('jwt'))) are kept on endpoints that need
 * them *within* the auth service (logout, getUser, updateUsername) because
 * those endpoints require a valid user context, and the auth service can
 * validate its own tokens via JwtStrategy.
 */
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    return this.authService.refresh(refreshToken, res);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @CurrentUser() user: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(user.id, res);
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@CurrentUser() user: { id: string }) {
    return this.authService.getUser(user.id);
  }

  @Patch('username')
  @UseGuards(AuthGuard('jwt'))
  async updateUsername(
    @CurrentUser() user: { id: string },
    @Body('username') username: string,
  ) {
    return this.authService.updateUsername(user.id, username);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
