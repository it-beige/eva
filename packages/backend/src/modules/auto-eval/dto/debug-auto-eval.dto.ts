import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FilterRules } from './create-auto-eval.dto';

export class DebugFilterDto {
  @IsString()
  @IsNotEmpty({ message: '开始时间不能为空' })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: '结束时间不能为空' })
  endTime: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FilterRules)
  filterRules?: FilterRules;

  @IsNumber()
  @Min(0, { message: '采样率不能小于0' })
  @Max(100, { message: '采样率不能大于100' })
  @IsOptional()
  sampleRate?: number;
}

export class DebugEvalDto {
  @IsString()
  @IsNotEmpty({ message: '开始时间不能为空' })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: '结束时间不能为空' })
  endTime: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FilterRules)
  filterRules?: FilterRules;

  @IsNumber()
  @Min(0, { message: '采样率不能小于0' })
  @Max(100, { message: '采样率不能大于100' })
  @IsOptional()
  sampleRate?: number;

  @IsString()
  @IsOptional()
  traceId?: string;
}
