import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Portfolio } from './schemas/portfolio.schema';
import { CreatePortfolioDto } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
  ) {}

  private mapDtoFields(dto: CreatePortfolioDto) {
    const education = dto.education
      ? dto.education.map((edu) => ({
          collegeName: edu.collegeName || '',
          degree: edu.degree || '',
          branch: edu.branch || '',
          cgpaOrPercentage: edu.cgpaOrPercentage || 0,
          yearOfJoining: edu.yearOfJoining ? new Date(edu.yearOfJoining) : undefined,
          yearOfPassing: edu.yearOfPassing ? new Date(edu.yearOfPassing) : undefined,
        }))
      : [];

    const professionalHistory = dto.professionalHistory
      ? dto.professionalHistory.map((hist) => ({
          companyName: hist.companyName || '',
          position: hist.position || '',
          responsibility: hist.responsibility || '',
          yearOfJoining: hist.yearOfJoining ? new Date(hist.yearOfJoining) : undefined,
          yearOfLeaving: hist.yearOfLeaving ? new Date(hist.yearOfLeaving) : undefined,
          isCurrentEmployee: hist.isCurrentEmployee === true || hist.isCurrentEmployee === 'true',
        }))
      : [];

    const projects = dto.projects
      ? dto.projects.map((proj) => ({
          title: proj.title,
          description: proj.description || '',
          link: proj.link || '',
        }))
      : [];

    const portfolioLinks = dto.portfolioLinks
      ? {
          github: dto.portfolioLinks.github || '',
          leetcode: dto.portfolioLinks.leetcode || '',
          gfg: dto.portfolioLinks.gfg || '',
        }
      : { github: '', leetcode: '', gfg: '' };

    return { education, professionalHistory, projects, portfolioLinks };
  }

  async create(userId: string, dto: CreatePortfolioDto, file?: Express.Multer.File): Promise<Portfolio> {
    const existing = await this.portfolioModel.findOne({ user: userId });
    if (existing) {
      throw new BadRequestException('Portfolio already exists');
    }

    const { education, professionalHistory, projects, portfolioLinks } = this.mapDtoFields(dto);

    const pdf = file
      ? {
          data: file.buffer,
          contentType: file.mimetype,
        }
      : null;

    const portfolio = new this.portfolioModel({
      user: userId,
      title: dto.title,
      description: dto.description || '',
      projects,
      portfolioLinks,
      education,
      professionalHistory,
      pdf,
    });

    return portfolio.save();
  }

  async update(userId: string, dto: CreatePortfolioDto, file?: Express.Multer.File): Promise<Portfolio> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const { education, professionalHistory, projects, portfolioLinks } = this.mapDtoFields(dto);

    const pdf = file
      ? {
          data: file.buffer,
          contentType: file.mimetype,
        }
      : portfolio.pdf;

    portfolio.title = dto.title;
    portfolio.description = dto.description || '';
    portfolio.projects = projects;
    portfolio.portfolioLinks = portfolioLinks;
    portfolio.education = education as any;
    portfolio.professionalHistory = professionalHistory as any;
    portfolio.pdf = pdf;

    return portfolio.save();
  }

  async getPdf(id: string): Promise<{ data: Buffer; contentType: string }> {
    const portfolio = await this.portfolioModel.findById(id);
    if (!portfolio || !portfolio.pdf) {
      throw new NotFoundException('PDF not found');
    }
    return {
      data: portfolio.pdf.data,
      contentType: portfolio.pdf.contentType,
    };
  }

  async getPortfolio(userId: string): Promise<Portfolio> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return portfolio;
  }

  async checkExists(userId: string): Promise<{ exists: boolean }> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    return { exists: !!portfolio };
  }

  async getPublic(userId: string): Promise<Portfolio> {
    const portfolio = await this.portfolioModel
      .findOne({ user: userId })
      .populate('user', 'name');

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return portfolio;
  }
}
