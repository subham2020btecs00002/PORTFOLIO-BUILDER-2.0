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
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { NestedFieldsInterceptor } from '../common/interceptors/nested-fields.interceptor';

@Controller('api/portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pdf'), NestedFieldsInterceptor)
  async create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePortfolioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.portfolioService.create(user.id, dto, file);
  }

  @Put()
  @UseInterceptors(FileInterceptor('pdf'), NestedFieldsInterceptor)
  async update(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePortfolioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.portfolioService.update(user.id, dto, file);
  }

  @Get('download/:id')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.portfolioService.getPdf(id);
    res.set('Content-Type', pdf.contentType);
    res.send(pdf.data);
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
