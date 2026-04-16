import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsJSON,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EvalType } from '@eva/shared';

export class AudioConfigDto {
  @IsUUID()
  @IsNotEmpty()
  datasetId: string;

  @IsUUID()
  @IsNotEmpty()
  configFileId: string;

  @IsString()
  @IsNotEmpty()
  configInfo: string;
}

export class CreateEvalTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(EvalType)
  @IsNotEmpty()
  evalType: EvalType;

  @IsString()
  @IsOptional()
  evalMode?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxConcurrency?: number = 10;

  @IsUUID()
  @IsOptional()
  evalSetId?: string;

  @IsUUID()
  @IsOptional()
  evalItemId?: string;

  @IsUUID()
  @IsOptional()
  appId?: string;

  @IsString()
  @IsOptional()
  appVersion?: string;

  @IsOptional()
  config?: Record<string, unknown>;

  // 音频agent额外配置
  @ValidateNested()
  @Type(() => AudioConfigDto)
  @IsOptional()
  audioConfig?: AudioConfigDto;
}
