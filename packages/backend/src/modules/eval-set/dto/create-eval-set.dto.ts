import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { EvalSetType, EvalSetSourceType } from '@eva/shared';

export class CreateEvalSetDto {
  @IsString()
  @IsNotEmpty({ message: '评测集名称不能为空' })
  @MaxLength(255, { message: '评测集名称不能超过255个字符' })
  name!: string;

  @IsEnum(EvalSetType, { message: '无效的评测集类型' })
  type!: EvalSetType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(EvalSetSourceType, { message: '无效的数据源类型' })
  sourceType!: EvalSetSourceType;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Git仓库地址不能超过500个字符' })
  gitRepoUrl?: string;

  @IsString()
  @IsOptional()
  publicEvalSetId?: string;

  // 本地上传相关
  @IsString()
  @IsOptional()
  fileUrl?: string;

  // ODPS相关
  @IsString()
  @IsOptional()
  odpsTableName?: string;

  @IsString()
  @IsOptional()
  odpsPartition?: string;

  // AI生成相关
  @IsString()
  @IsOptional()
  exampleFileUrl?: string;

  @IsString()
  @IsOptional()
  aiModelId?: string;

  @IsOptional()
  aiGenerateCount?: number;

  // 空白评测集相关
  @IsOptional()
  columns?: Array<{ name: string; type: string }>;

  // SDK相关
  @IsString()
  @IsOptional()
  sdkEndpoint?: string;

  @IsString()
  @IsOptional()
  sdkApiKey?: string;
}
