import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AutoEvalStatus } from '@eva/shared';

export class FilterCondition {
  @IsString()
  @IsNotEmpty({ message: '字段不能为空' })
  field: string;

  @IsString()
  @IsNotEmpty({ message: '操作符不能为空' })
  operator: string;

  @IsString()
  @IsNotEmpty({ message: '值不能为空' })
  value: string;
}

export class FilterRules {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterCondition)
  conditions: FilterCondition[];
}

export class CreateAutoEvalDto {
  @IsString()
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @IsEnum(AutoEvalStatus, { message: '状态必须是 enabled 或 disabled' })
  @IsOptional()
  status?: AutoEvalStatus = AutoEvalStatus.ENABLED;

  @IsOptional()
  @ValidateNested()
  @Type(() => FilterRules)
  filterRules?: FilterRules;

  @IsNumber()
  @Min(0, { message: '采样率不能小于0' })
  @Max(100, { message: '采样率不能大于100' })
  @IsNotEmpty({ message: '采样率不能为空' })
  sampleRate: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  metricIds?: string[];
}
