import { Controller, Post, Get, Patch, Body, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@UseGuards(ThrottlerGuard)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
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
}

