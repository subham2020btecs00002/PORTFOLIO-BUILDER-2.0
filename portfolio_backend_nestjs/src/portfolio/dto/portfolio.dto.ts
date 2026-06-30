import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
}

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

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
