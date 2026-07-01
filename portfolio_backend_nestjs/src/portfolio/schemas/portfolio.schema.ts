import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Skill {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'Intermediate', enum: ['Beginner', 'Intermediate', 'Expert'] })
  level: string;

  @Prop({ default: '' })
  category: string;
}

const SkillSchema = SchemaFactory.createForClass(Skill);

@Schema()
export class Project {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  link: string;
}

const ProjectSchema = SchemaFactory.createForClass(Project);

@Schema()
export class Education {
  @Prop()
  collegeName: string;

  @Prop()
  degree: string;

  @Prop()
  branch: string;

  @Prop()
  cgpaOrPercentage: number;

  @Prop()
  yearOfJoining: Date;

  @Prop()
  yearOfPassing: Date;
}

const EducationSchema = SchemaFactory.createForClass(Education);

@Schema()
export class ProfessionalHistory {
  @Prop()
  companyName: string;

  @Prop()
  position: string;

  @Prop()
  responsibility: string;

  @Prop()
  yearOfJoining: Date;

  @Prop()
  yearOfLeaving: Date;

  @Prop()
  isCurrentEmployee: boolean;
}

const ProfessionalHistorySchema = SchemaFactory.createForClass(ProfessionalHistory);

@Schema()
export class PortfolioLinks {
  @Prop()
  github: string;

  @Prop()
  leetcode: string;

  @Prop()
  gfg: string;

  @Prop()
  linkedin: string;
}

const PortfolioLinksSchema = SchemaFactory.createForClass(PortfolioLinks);

@Schema()
export class PdfData {
  @Prop({ type: Buffer })
  data: Buffer;

  @Prop()
  contentType: string;
}

const PdfDataSchema = SchemaFactory.createForClass(PdfData);

@Schema()
export class Analytics {
  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  contactCount: number;

  @Prop({ default: null })
  lastVisited: Date;
}

const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

@Schema({ timestamps: true })
export class Portfolio extends Document {
  /** Reference to the User document in auth-service's users collection */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId | string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [ProjectSchema], default: [] })
  projects: Project[];

  @Prop({ type: [EducationSchema], default: [] })
  education: Education[];

  @Prop({ type: [ProfessionalHistorySchema], default: [] })
  professionalHistory: ProfessionalHistory[];

  @Prop({ type: PortfolioLinksSchema })
  portfolioLinks: PortfolioLinks;

  @Prop({ type: [SkillSchema], default: [] })
  skills: Skill[];

  /** Template identifier: 'classic-green' | 'dark-pro' | 'creative' */
  @Prop({ default: 'classic-green' })
  templateId: string;

  @Prop({ type: PdfDataSchema })
  pdf: PdfData;

  @Prop({ type: AnalyticsSchema, default: () => ({}) })
  analytics: Analytics;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
