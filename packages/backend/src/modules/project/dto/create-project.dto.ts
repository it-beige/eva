import { IsString, IsOptional, IsArray, IsEnum, MaxLength, MinLength, ArrayMinSize } from 'class-validator';
import { ProjectCreateMode } from '@eva/shared';

export class CreateProjectDto {
  @IsEnum(ProjectCreateMode)
  createMode: ProjectCreateMode;

  @IsOptional()
  @IsString()
  pid?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  linkedApp?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  projectName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jointApps?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  adminIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}
