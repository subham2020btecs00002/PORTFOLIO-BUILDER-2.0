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
  BadRequestException,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import type { Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { NestedFieldsInterceptor } from '../common/interceptors/nested-fields.interceptor';
import { MlClientService } from './ml-client.service';
import type { Request } from 'express';
import { Req } from '@nestjs/common';

@Controller('api/portfolio')
export class PortfolioController {
  constructor(
    private portfolioService: PortfolioService,
    private mlClientService: MlClientService,
  ) {}

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
    @UploadedFiles()
    files?: { pdf?: Express.Multer.File[]; avatar?: Express.Multer.File[] },
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
    @UploadedFiles()
    files?: { pdf?: Express.Multer.File[]; avatar?: Express.Multer.File[] },
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

  @Post('ai/recommendations')
  async getAiRecommendations(@CurrentUser() user: { id: string }) {
    return this.portfolioService.generateAiRecommendations(user.id);
  }

  @Get('ai/usage')
  async getAiUsage(@Req() req: Request) {
    const userId = (req.headers['x-user-id'] as string) || '';
    const userRole = (req.headers['x-user-role'] as string) || 'user';
    return this.portfolioService.getAiUsage(userId, userRole);
  }

  @Post('ai/enhance')
  async enhanceText(@Body() body: { text: string }, @Req() req: Request) {
    if (!body?.text || body.text.trim().length < 5) {
      throw new BadRequestException('Text must be at least 5 characters long');
    }
    const correlationId = (req.headers['x-correlation-id'] as string) || '';
    return this.mlClientService.enhanceText(body.text, correlationId);
  }

  @Post('ai/parse-resume')
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No resume file uploaded');
    }
    const userId = (req.headers['x-user-id'] as string) || '';
    const userRole = (req.headers['x-user-role'] as string) || 'user';
    const correlationId = (req.headers['x-correlation-id'] as string) || '';

    // Enforce daily rate limit (4 times per day per user, admin unlimited)
    if (userId) {
      await this.portfolioService.assertAiImportAllowed(userId, userRole);
    }

    const parsedData = await this.mlClientService.parseResume(
      file.buffer,
      file.mimetype,
      file.originalname,
      correlationId,
    );

    // Increment AI usage upon successful parse
    if (userId && userRole !== 'admin') {
      try {
        await this.portfolioService.recordAiUsage(userId);
      } catch {
        // Non-blocking error handling
      }
    }

    return parsedData;
  }

  @Delete('ai/recommendations')
  async clearRecommendations(@CurrentUser() user: { id: string }) {
    return this.portfolioService.clearRecommendations(user.id);
  }
}
