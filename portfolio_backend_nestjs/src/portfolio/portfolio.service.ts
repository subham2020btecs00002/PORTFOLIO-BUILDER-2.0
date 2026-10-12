import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Portfolio } from './schemas/portfolio.schema';
import { User } from '../common/schemas/user.schema';
import { AiUsage } from './schemas/ai-usage.schema';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { MlClientService } from './ml-client.service';
import { IntelligenceClientService } from './intelligence-client.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(AiUsage.name) private aiUsageModel: Model<AiUsage>,
    private readonly mlClientService: MlClientService,
    private readonly intelligenceClientService: IntelligenceClientService,
  ) {}

  private mapDtoFields(dto: CreatePortfolioDto) {
    const education = dto.education
      ? dto.education.map((edu) => {
          let isCurrent =
            edu.isCurrentStudent === true ||
            (edu.isCurrentStudent as any) === 'true';

          // If a graduation date is provided and is in the past, candidate has already graduated
          if (edu.yearOfPassing) {
            const passDate = new Date(edu.yearOfPassing);
            if (!isNaN(passDate.getTime()) && passDate < new Date()) {
              isCurrent = false;
            }
          }

          return {
            collegeName: edu.collegeName || '',
            degree: edu.degree || '',
            branch: edu.branch || '',
            cgpaOrPercentage:
              edu.cgpaOrPercentage !== undefined &&
              edu.cgpaOrPercentage !== null
                ? String(edu.cgpaOrPercentage).trim()
                : '',
            isCurrentStudent: isCurrent,
            yearOfJoining: edu.yearOfJoining
              ? new Date(edu.yearOfJoining)
              : undefined,
            yearOfPassing: edu.yearOfPassing
              ? new Date(edu.yearOfPassing)
              : undefined,
          };
        })
      : [];

    const professionalHistory = dto.professionalHistory
      ? dto.professionalHistory.map((hist) => ({
          companyName: hist.companyName || '',
          position: hist.position || '',
          responsibility: hist.responsibility || '',
          yearOfJoining: hist.yearOfJoining
            ? new Date(hist.yearOfJoining)
            : undefined,
          yearOfLeaving: hist.yearOfLeaving
            ? new Date(hist.yearOfLeaving)
            : undefined,
          isCurrentEmployee:
            hist.isCurrentEmployee === true ||
            hist.isCurrentEmployee === 'true',
          technologies: hist.technologies || [],
        }))
      : [];

    const projects = dto.projects
      ? dto.projects.map((proj) => ({
          title: proj.title,
          description: proj.description || '',
          link: proj.link || '',
          technologies: proj.technologies || [],
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

  async create(
    userId: string,
    dto: CreatePortfolioDto,
    file?: Express.Multer.File,
    avatarFile?: Express.Multer.File,
  ): Promise<Portfolio> {
    const existing = await this.portfolioModel.findOne({ user: userId });
    if (existing) {
      throw new BadRequestException('Portfolio already exists');
    }

    const { education, professionalHistory, projects, portfolioLinks, skills } =
      this.mapDtoFields(dto);

    const pdf = file ? { data: file.buffer, contentType: file.mimetype } : null;

    const avatar = avatarFile
      ? { data: avatarFile.buffer, contentType: avatarFile.mimetype }
      : null;

    const portfolio = new this.portfolioModel({
      user: userId,
      title: dto.title,
      fullName: dto.fullName || '',
      description: dto.description || '',
      templateId: dto.templateId || 'classic-green',
      sectionOrder: dto.sectionOrder || [
        'about',
        'skills',
        'experience',
        'projects',
        'contact',
      ],
      themeColor: dto.themeColor || 'default',
      fontFamily: dto.fontFamily || 'default',
      borderRadius: dto.borderRadius || 'default',
      projects,
      portfolioLinks,
      education,
      professionalHistory,
      skills,
      pdf,
      avatar,
    });

    const saved = await portfolio.save();
    return saved;
  }

  async update(
    userId: string,
    dto: CreatePortfolioDto,
    file?: Express.Multer.File,
    avatarFile?: Express.Multer.File,
  ): Promise<Portfolio> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const { education, professionalHistory, projects, portfolioLinks, skills } =
      this.mapDtoFields(dto);

    const pdf = file
      ? { data: file.buffer, contentType: file.mimetype }
      : portfolio.pdf;

    const avatar = avatarFile
      ? { data: avatarFile.buffer, contentType: avatarFile.mimetype }
      : portfolio.avatar;

    portfolio.title = dto.title;
    if (dto.fullName !== undefined) {
      portfolio.fullName = dto.fullName;
    }
    portfolio.description = dto.description || '';
    portfolio.templateId =
      dto.templateId || portfolio.templateId || 'classic-green';
    portfolio.sectionOrder = dto.sectionOrder ||
      portfolio.sectionOrder || [
        'about',
        'skills',
        'experience',
        'projects',
        'contact',
      ];
    portfolio.themeColor = dto.themeColor || portfolio.themeColor || 'default';
    portfolio.fontFamily = dto.fontFamily || portfolio.fontFamily || 'default';
    portfolio.borderRadius =
      dto.borderRadius || portfolio.borderRadius || 'default';
    portfolio.projects = projects;
    portfolio.portfolioLinks = portfolioLinks;
    portfolio.education = education as any;
    portfolio.professionalHistory = professionalHistory as any;
    portfolio.skills = skills;
    portfolio.pdf = pdf;
    portfolio.avatar = avatar;

    const saved = await portfolio.save();
    return saved;
  }

  async updateRecommendations(
    portfolioId: string,
    recommendations: {
      template?: string;
      themeColor?: string;
      fontFamily?: string;
      borderRadius?: string;
      sectionOrder?: string[];
    },
    enhancedDescription?: string,
  ): Promise<Portfolio> {
    const portfolio = await this.portfolioModel.findById(portfolioId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found for AI recommendations');
    }

    portfolio.aiRecommendations = {
      templateId: recommendations?.template
        ? recommendations.template.toLowerCase()
        : undefined,
      themeColor: recommendations?.themeColor,
      fontFamily: recommendations?.fontFamily,
      borderRadius: recommendations?.borderRadius,
      sectionOrder: recommendations?.sectionOrder,
      enhancedDescription: enhancedDescription,
      suggestedAt: new Date(),
    };

    portfolio.markModified('aiRecommendations');

    const saved = await portfolio.save();
    console.log(
      `[PortfolioService] Successfully saved AI recommendations to portfolio recommendations field: ${portfolioId}`,
    );
    return saved;
  }

  async clearRecommendations(userId: string): Promise<Portfolio> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException(
        'Portfolio not found for recommendations cleanup',
      );
    }

    portfolio.aiRecommendations = null as any;
    portfolio.markModified('aiRecommendations');
    return await portfolio.save();
  }

  async generateAiRecommendations(userId: string): Promise<any> {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const skillsList = portfolio.skills
      ? portfolio.skills.map((s) => s.name)
      : [];
    const industry = portfolio.title || 'Software Development';

    try {
      const data = await this.mlClientService.recommendTheme(
        industry,
        skillsList,
      );

      let enhancedDescription = '';
      if (portfolio.description && portfolio.description.trim().length > 5) {
        try {
          const enhanceData = await this.mlClientService.enhanceText(
            portfolio.description,
          );
          enhancedDescription = enhanceData.enhanced;
        } catch (e) {
          console.error(
            '[PortfolioService] Description auto-enhance failed:',
            e,
          );
        }
      }

      // Update recommendations in the DB and return the updated sub-document
      const updated = await this.updateRecommendations(
        portfolio._id.toString(),
        data,
        enhancedDescription,
      );
      return {
        recommendations: updated.aiRecommendations,
      };
    } catch (err) {
      console.error(
        '[PortfolioService] Error generating AI recommendations:',
        err,
      );
      throw new BadRequestException('Failed to generate AI recommendations');
    }
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

  async getAvatar(id: string): Promise<{ data: Buffer; contentType: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Avatar not found');
    }
    const portfolio = await this.portfolioModel.findById(id);
    if (!portfolio || !portfolio.avatar || !portfolio.avatar.data) {
      throw new NotFoundException('Avatar not found');
    }
    return {
      data: portfolio.avatar.data,
      contentType: portfolio.avatar.contentType,
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

  async getAnalytics(userId: string): Promise<{
    views: number;
    contactCount: number;
    lastVisited: Date | null;
  }> {
    const portfolio = await this.portfolioModel
      .findOne({ user: userId })
      .select('analytics');
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

  async getAiUsage(userId: string, role?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;
    const usage = await this.aiUsageModel
      .findOne({ userId: userObjectId, date: today } as any)
      .lean();
    const used = usage?.count || 0;
    const isAdmin = role === 'admin';

    const resetDate = new Date();
    resetDate.setUTCHours(24, 0, 0, 0);

    return {
      used,
      limit: 4,
      remaining: isAdmin ? 'Unlimited' : Math.max(0, 4 - used),
      isAdmin,
      resetAt: resetDate.toISOString(),
    };
  }

  async assertAiImportAllowed(userId: string, role?: string): Promise<void> {
    if (role === 'admin') return;

    const today = new Date().toISOString().slice(0, 10);
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;
    const usage = await this.aiUsageModel
      .findOne({ userId: userObjectId, date: today } as any)
      .lean();
    const used = usage?.count || 0;

    if (used >= 4) {
      throw new HttpException(
        'Daily AI resume import limit reached (4/4). Your quota resets at 00:00 UTC.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordAiUsage(userId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    const userObjectId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : userId;
    await this.aiUsageModel.updateOne(
      { userId: userObjectId, date: today } as any,
      { $inc: { count: 1 } },
      { upsert: true },
    );
  }

  // ── Portfolio Intelligence & DRL Engine ─────────────────────────────────

  async getOrComputeIntelligenceEvaluation(
    userId: string,
    forceRefresh: boolean = false,
    correlationId?: string,
  ) {
    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Return cached evaluation if fresh and not forcing refresh
    if (!forceRefresh && portfolio.intelligenceEvaluation?.atsScore) {
      return portfolio.intelligenceEvaluation;
    }

    const payload = {
      title: portfolio.title || 'Software Engineer',
      fullName: portfolio.fullName || '',
      description: portfolio.description || '',
      skills: portfolio.skills || [],
      projects: portfolio.projects || [],
      professionalHistory: portfolio.professionalHistory || [],
      education: portfolio.education || [],
    };

    const evaluation = await this.intelligenceClientService.evaluatePortfolio(
      payload,
      correlationId,
    );

    if (evaluation) {
      portfolio.intelligenceEvaluation = {
        atsScore: evaluation.ats_score,
        grade: evaluation.grade,
        readabilityIndex: evaluation.readability_index,
        metricDensity: evaluation.metric_density,
        actionVerbRatio: evaluation.action_verb_ratio,
        shapExplanations: evaluation.shap_explanations,
        skillRecommendations: (evaluation.skill_gap_recommendations || []).map(
          (s) => ({
            skill: s.skill,
            relevanceScore: s.relevance_score,
            category: s.category,
          }),
        ),
        evaluatedAt: new Date(),
      };
      portfolio.markModified('intelligenceEvaluation');
      await portfolio.save();
      return portfolio.intelligenceEvaluation;
    }

    return portfolio.intelligenceEvaluation || null;
  }

  async getPublicLayoutPolicy(
    username: string,
    visitorContext: any,
    correlationId?: string,
  ) {
    const user = await this.userModel.findOne({
      username: username.toLowerCase().trim(),
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const portfolio = await this.portfolioModel.findOne({
      user: user._id.toString(),
    });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const candidateProfile = {
      yearsOfExperience: (portfolio.professionalHistory || []).length * 1.5,
      primaryDomain: portfolio.title || 'Backend',
      projectCount: (portfolio.projects || []).length,
      skillCount: (portfolio.skills || []).length,
    };

    const policy = await this.intelligenceClientService.getLayoutPolicy(
      candidateProfile,
      visitorContext,
      correlationId,
    );

    if (policy) {
      // Non-blocking update of last recommended policy on portfolio
      portfolio.drlPolicy = {
        actionId: policy.action_id,
        templateId: policy.template_id,
        sectionOrder: policy.section_order,
        spotlightProjectIndex: policy.spotlight_project_index,
        actionDescription: policy.action_description,
        predictedUcb: policy.predicted_ucb,
        updatedAt: new Date(),
      };
      portfolio.markModified('drlPolicy');
      portfolio.save().catch(() => {});
      return policy;
    }

    // Safe fallback to user's saved static preferences if intelligence service unreachable
    return {
      action_id: 'a_default',
      template_id: portfolio.templateId || 'classic-green',
      section_order: portfolio.sectionOrder || [
        'about',
        'skills',
        'experience',
        'projects',
        'contact',
      ],
      spotlight_project_index: 0,
      action_description: 'User Default Configuration',
      context_vector: [],
      predicted_ucb: 0.0,
      exploration_mode: false,
      decided_at: new Date().toISOString(),
    };
  }

  async recordTelemetryReward(telemetryData: any, correlationId?: string) {
    return this.intelligenceClientService.submitTelemetryReward(
      telemetryData,
      correlationId,
    );
  }
}
