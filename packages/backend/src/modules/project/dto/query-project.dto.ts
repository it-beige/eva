import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectSource } from '@eva/shared';

export class QueryProjectDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(ProjectSource)
  source?: ProjectSource;

  @IsOptional()
  @IsString()
  adminId?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
