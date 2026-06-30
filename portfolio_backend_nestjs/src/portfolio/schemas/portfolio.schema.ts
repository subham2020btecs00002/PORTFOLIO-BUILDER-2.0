import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

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

@Schema({ timestamps: true })
export class Portfolio extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User | string;

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

  @Prop({ type: PdfDataSchema })
  pdf: PdfData;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);
