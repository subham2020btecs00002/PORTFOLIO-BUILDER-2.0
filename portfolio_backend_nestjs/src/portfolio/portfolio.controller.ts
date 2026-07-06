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
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { AiStreamService } from './ai-stream.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { NestedFieldsInterceptor } from '../common/interceptors/nested-fields.interceptor';

@Controller('api/portfolio')
export class PortfolioController {
  constructor(
    private portfolioService: PortfolioService,
    private aiStreamService: AiStreamService,
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

  @EventPattern('ml_analysis_completed')
  async handleMlAnalysisCompleted(@Payload() data: any) {
    console.log(`[PortfolioController] Received ml_analysis_completed event for: ${data.portfolioId}`);
    await this.portfolioService.updateRecommendations(
      data.portfolioId,
      data.recommendations,
      data.enhancedDescription
    );
  }

  @Sse('ai/stream/:userId')
  streamAiUpdates(@Param('userId') userId: string): Observable<MessageEvent> {
    const { filter, map } = require('rxjs/operators');
    return this.aiStreamService.getStream().pipe(
      filter((event: any) => event.userId === userId),
      map((event: any) => ({ data: event } as MessageEvent)),
    );
  }

  @Post('ai/enhance')
  async enhanceText(@Body() body: { text: string }) {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${mlUrl}/api/ml/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: body.text }),
      });
      if (!res.ok) {
        throw new Error('AI Service returned non-200');
      }
      return await res.json();
    } catch (err) {
      console.error('[PortfolioController] Error communicating with ML service:', err);
      throw new BadRequestException('Failed to communicate with AI service');
    }
  }

  @Post('ai/parse-resume')
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No resume file uploaded');
    }
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    formData.append('file', blob, file.originalname);
    
    try {
      const res = await fetch(`${mlUrl}/api/ml/parse-resume`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('AI Service returned non-200');
      }
      return await res.json();
    } catch (err) {
      console.error('[PortfolioController] Error parsing resume from ML service:', err);
      throw new BadRequestException('Failed to process and parse resume');
    }
  }

  @Delete('ai/recommendations')
  async clearRecommendations(@CurrentUser('id') userId: string) {
    return this.portfolioService.clearRecommendations(userId);
  }
}
