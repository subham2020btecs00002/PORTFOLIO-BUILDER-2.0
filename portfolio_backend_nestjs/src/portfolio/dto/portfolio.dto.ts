import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SkillDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export class ProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];
}

export class EducationDto {
  @IsString()
  @IsOptional()
  collegeName?: string;

  @IsString()
  @IsOptional()
  degree?: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsOptional()
  cgpaOrPercentage?: number;

  @IsOptional()
  yearOfJoining?: string;

  @IsOptional()
  yearOfPassing?: string;
}

export class ProfessionalHistoryDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  responsibility?: string;

  @IsOptional()
  yearOfJoining?: string;

  @IsOptional()
  yearOfLeaving?: string;

  @IsOptional()
  isCurrentEmployee?: any;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];
}

export class PortfolioLinksDto {
  @IsString()
  @IsOptional()
  github?: string;

  @IsString()
  @IsOptional()
  leetcode?: string;

  @IsString()
  @IsOptional()
  gfg?: string;

  @IsString()
  @IsOptional()
  linkedin?: string;
}

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  sectionOrder?: string[];

  @IsString()
  @IsOptional()
  themeColor?: string;

  @IsString()
  @IsOptional()
  fontFamily?: string;

  @IsString()
  @IsOptional()
  borderRadius?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProfessionalHistoryDto)
  professionalHistory?: ProfessionalHistoryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PortfolioLinksDto)
  portfolioLinks?: PortfolioLinksDto;
}
