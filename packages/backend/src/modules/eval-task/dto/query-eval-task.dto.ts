import { IsString, IsOptional, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { EvalTaskStatus } from '@eva/shared';

export class QueryEvalTaskDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;

  @IsString()
  @IsOptional()
  keyword?: string;

  @IsUUID()
  @IsOptional()
  evalSetId?: string;

  @IsEnum(EvalTaskStatus)
  @IsOptional()
  status?: EvalTaskStatus;

  @IsString()
  @IsOptional()
  evalType?: string;
}
