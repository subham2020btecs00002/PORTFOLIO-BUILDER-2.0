import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../common/schemas/user.schema';
import { Portfolio } from '../portfolio/schemas/portfolio.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Portfolio.name) private readonly portfolioModel: Model<Portfolio>,
  ) {}

  async getAdminStats() {
    const totalUsers = await this.userModel.countDocuments();
    const totalPortfolios = await this.portfolioModel.countDocuments();

    // Slices date boundaries for registration charts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [registrationsOverTime, portfoliosOverTime] = await Promise.all([
      this.userModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 as const } },
      ]),
      this.portfolioModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 as const } },
      ]),
    ]);

    // Template Distribution
    const templateUsage = await this.portfolioModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$templateId', 'classic-green'] },
          count: { $sum: 1 },
        },
      },
      { $project: { templateId: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Accent Colors Preferences
    const themeColorUsage = await this.portfolioModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$themeColor', 'default'] },
          count: { $sum: 1 },
        },
      },
      { $project: { color: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Fonts Preferences
    const fontFamilyUsage = await this.portfolioModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$fontFamily', 'default'] },
          count: { $sum: 1 },
        },
      },
      { $project: { font: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // Border Radius Preferences
    const borderRadiusUsage = await this.portfolioModel.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$borderRadius', 'default'] },
          count: { $sum: 1 },
        },
      },
      { $project: { radius: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    return {
      totalUsers,
      totalPortfolios,
      templateUsage,
      themeColorUsage,
      fontFamilyUsage,
      borderRadiusUsage,
      // Map aggregated dates to format required by chart libraries [{ date: "2026-07-02", count: 5 }]
      registrationsOverTime: registrationsOverTime.map((item) => ({
        date: item._id,
        count: item.count,
      })),
      portfoliosOverTime: portfoliosOverTime.map((item) => ({
        date: item._id,
        count: item.count,
      })),
    };
  }

  async getUsersWithPortfolios(search?: string) {
    const matchStage: any = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      matchStage.$or = [
        { name: regex },
        { email: regex },
        { username: regex },
      ];
    }

    return this.userModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'portfolios',
          localField: '_id',
          foreignField: 'user',
          as: 'portfolio',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          username: 1,
          createdAt: 1,
          hasPortfolio: { $gt: [{ $size: '$portfolio' }, 0] },
          portfolioStats: {
            $cond: {
              if: { $gt: [{ $size: '$portfolio' }, 0] },
              then: {
                $let: {
                  vars: { p: { $arrayElemAt: ['$portfolio', 0] } },
                  in: {
                    templateId: '$$p.templateId',
                    themeColor: '$$p.themeColor',
                    fontFamily: '$$p.fontFamily',
                    projectsCount: { $size: { $ifNull: ['$$p.projects', []] } },
                    skillsCount: { $size: { $ifNull: ['$$p.skills', []] } },
                    educationCount: { $size: { $ifNull: ['$$p.education', []] } },
                    experienceCount: { $size: { $ifNull: ['$$p.professionalHistory', []] } },
                    views: { $ifNull: ['$$p.analytics.views', 0] },
                    contactCount: { $ifNull: ['$$p.analytics.contactCount', 0] },
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async updateUserRole(adminId: string, userId: string, role: string) {
    if (role !== 'admin' && role !== 'user') {
      throw new BadRequestException('Invalid role. Allowed roles are admin or user');
    }

    if (adminId === userId) {
      throw new BadRequestException('Self-demotion or changing your own role is not allowed.');
    }

    const targetUser = await this.userModel.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Block demotion of admin accounts
    if (targetUser.role === 'admin' && role === 'user') {
      throw new BadRequestException('Demoting other admin accounts is not allowed.');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true },
    ).select('-password');

    return updatedUser;
  }

  async deleteUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new BadRequestException('Self-deletion is not allowed.');
    }

    const targetUser = await this.userModel.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    if (targetUser.role === 'admin') {
      throw new BadRequestException('Deleting other admin accounts is not allowed.');
    }

    // Cascade delete portfolio if it exists
    await this.portfolioModel.deleteOne({ user: userId });

    // Delete user account
    await this.userModel.findByIdAndDelete(userId);

    return { message: `User "${targetUser.name}" (${targetUser.email}) and their portfolio were successfully deleted.` };
  }

  async deleteUserPortfolio(userId: string) {
    const targetUser = await this.userModel.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    if (targetUser.role === 'admin') {
      throw new BadRequestException("Deleting another admin's portfolio is not allowed.");
    }

    const portfolio = await this.portfolioModel.findOne({ user: userId });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found for this user.');
    }

    await this.portfolioModel.deleteOne({ user: userId });

    return { message: `Portfolio for user "${targetUser.name}" was successfully deleted.` };
  }
}
