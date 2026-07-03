import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { NestedFieldsInterceptor } from '../common/interceptors/nested-fields.interceptor';

@Controller('api/portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'avatar', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 2 * 1024 * 1024, // 2MB limit for all files
        },
      },
    ),
    NestedFieldsInterceptor,
  )
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePortfolioDto,
    @UploadedFiles() files?: { pdf?: Express.Multer.File[]; avatar?: Express.Multer.File[] },
  ) {
    const pdfFile = files?.pdf?.[0];
    const avatarFile = files?.avatar?.[0];
    return this.portfolioService.create(user.id, dto, pdfFile, avatarFile);
  }

  @Put()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf', maxCount: 1 },
        { name: 'avatar', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 2 * 1024 * 1024, // 2MB limit for all files
        },
      },
    ),
    NestedFieldsInterceptor,
  )
  async update(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePortfolioDto,
    @UploadedFiles() files?: { pdf?: Express.Multer.File[]; avatar?: Express.Multer.File[] },
  ) {
    const pdfFile = files?.pdf?.[0];
    const avatarFile = files?.avatar?.[0];
    return this.portfolioService.update(user.id, dto, pdfFile, avatarFile);
  }

  @Get('download/:id')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.portfolioService.getPdf(id);
    res.set('Content-Type', pdf.contentType);
    res.send(pdf.data);
  }

  @Get('avatar/:id')
  async getAvatar(@Param('id') id: string, @Res() res: Response) {
    const avatar = await this.portfolioService.getAvatar(id);
    res.set('Content-Type', avatar.contentType);
    res.send(avatar.data);
  }

  @Get('analytics')
  async getAnalytics(@CurrentUser() user: { id: string }) {
    return this.portfolioService.getAnalytics(user.id);
  }

  @Get('exists')
  async checkExists(@CurrentUser() user: { id: string }) {
    return this.portfolioService.checkExists(user.id);
  }

  @Get()
  async getPortfolio(@CurrentUser() user: { id: string }) {
    return this.portfolioService.getPortfolio(user.id);
  }

  /** Public portfolio by custom username slug — /api/portfolio/public/by-username/:username */
  @Get('public/by-username/:username')
  async getPublicByUsername(@Param('username') username: string) {
    return this.portfolioService.getPublicByUsername(username);
  }

  /** Public portfolio by MongoDB user ID (kept for internal use) */
  @Get('public/:userId')
  async getPublic(@Param('userId') userId: string) {
    return this.portfolioService.getPublic(userId);
  }

  @Delete()
  async delete(@CurrentUser() user: { id: string }) {
    await this.portfolioService.deletePortfolio(user.id);
    return { message: 'Portfolio successfully deleted.' };
  }
}
