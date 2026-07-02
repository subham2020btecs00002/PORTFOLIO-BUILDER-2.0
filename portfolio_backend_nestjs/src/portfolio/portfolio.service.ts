import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Portfolio } from './schemas/portfolio.schema';
import { User } from '../common/schemas/user.schema';
import { CreatePortfolioDto } from './dto/portfolio.dto';


@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    @InjectModel(User.name) private userModel: Model<User>,
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

    const skills = dto.skills
      ? dto.skills.map((skill) => ({
          name: skill.name,
          level: skill.level || 'Intermediate',
          category: skill.category || '',
        }))
      : [];

    const portfolioLinks = dto.portfolioLinks
      ? {
          github: dto.portfolioLinks.github || '',
          leetcode: dto.portfolioLinks.leetcode || '',
          gfg: dto.portfolioLinks.gfg || '',
          linkedin: dto.portfolioLinks.linkedin || '',
        }
      : { github: '', leetcode: '', gfg: '', linkedin: '' };

    return { education, professionalHistory, projects, portfolioLinks, skills };
  }

  async create(userId: string, dto: CreatePortfolioDto, file?: Express.Multer.File): Promise<Portfolio> {
    const existing = await this.portfolioModel.findOne({ user: userId });
    if (existing) {
      throw new BadRequestException('Portfolio already exists');
    }

    const { education, professionalHistory, projects, portfolioLinks, skills } = this.mapDtoFields(dto);

    const pdf = file
      ? { data: file.buffer, contentType: file.mimetype }
      : null;

    const portfolio = new this.portfolioModel({
      user: userId,
      title: dto.title,
      description: dto.description || '',
      templateId: dto.templateId || 'classic-green',
      sectionOrder: dto.sectionOrder || ['about', 'skills', 'experience', 'projects', 'contact'],
      themeColor: dto.themeColor || 'default',
      fontFamily: dto.fontFamily || 'default',
      borderRadius: dto.borderRadius || 'default',
      projects,
      portfolioLinks,
      education,
      professionalHistory,
      skills,
      pdf,
    });

    return portfolio.save();
  }

  async update(userId: string, dto: CreatePortfolioDto, file?: Express.Multer.File): Promise<Portfolio> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const { education, professionalHistory, projects, portfolioLinks, skills } = this.mapDtoFields(dto);

    const pdf = file
      ? { data: file.buffer, contentType: file.mimetype }
      : portfolio.pdf;

    portfolio.title = dto.title;
    portfolio.description = dto.description || '';
    portfolio.templateId = dto.templateId || portfolio.templateId || 'classic-green';
    portfolio.sectionOrder = dto.sectionOrder || portfolio.sectionOrder || ['about', 'skills', 'experience', 'projects', 'contact'];
    portfolio.themeColor = dto.themeColor || portfolio.themeColor || 'default';
    portfolio.fontFamily = dto.fontFamily || portfolio.fontFamily || 'default';
    portfolio.borderRadius = dto.borderRadius || portfolio.borderRadius || 'default';
    portfolio.projects = projects;
    portfolio.portfolioLinks = portfolioLinks as any;
    portfolio.education = education as any;
    portfolio.professionalHistory = professionalHistory as any;
    portfolio.skills = skills as any;
    portfolio.pdf = pdf;

    return portfolio.save();
  }

  async getPdf(id: string): Promise<{ data: Buffer; contentType: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('PDF not found');
    }
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

  /** Fetch portfolio by MongoDB user ID — increments view count */
  async getPublic(userId: string): Promise<Portfolio> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Portfolio not found');
    }
    const portfolio = (await this.portfolioModel
      .findOneAndUpdate(
        { user: userId },
        {
          $inc: { 'analytics.views': 1 },
          $set: { 'analytics.lastVisited': new Date() },
        },
        { new: true },
      )
      .populate('user', 'name username')) as unknown as Portfolio | null;

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return portfolio;
  }

  /** Fetch portfolio by custom username slug — increments view count */
  async getPublicByUsername(username: string): Promise<Portfolio> {
    const user = await this.userModel.findOne({
      username: username.toLowerCase().trim(),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const portfolio = (await this.portfolioModel
      .findOneAndUpdate(
        { user: user._id.toString() },
        {
          $inc: { 'analytics.views': 1 },
          $set: { 'analytics.lastVisited': new Date() },
        },
        { new: true },
      )
      .populate('user', 'name username')) as unknown as Portfolio | null;

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return portfolio;
  }

  async getAnalytics(userId: string): Promise<{ views: number; contactCount: number; lastVisited: Date | null }> {
    const portfolio = await this.portfolioModel.findOne({ user: userId }).select('analytics');
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return {
      views: portfolio.analytics?.views ?? 0,
      contactCount: portfolio.analytics?.contactCount ?? 0,
      lastVisited: portfolio.analytics?.lastVisited ?? null,
    };
  }

  async incrementContactCount(userId: string): Promise<void> {
    await this.portfolioModel.findOneAndUpdate(
      { user: userId },
      { $inc: { 'analytics.contactCount': 1 } },
    );
  }

  async deletePortfolio(userId: string): Promise<void> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    await this.portfolioModel.deleteOne({ user: userId });
  }
}
