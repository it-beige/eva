import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { MetricType, MetricScope } from '@eva/shared';

export class CreateEvalMetricDto {
  @IsString()
  @IsNotEmpty({ message: '指标名称不能为空' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MetricType, { message: '指标类型必须是 llm 或 code' })
  @IsNotEmpty({ message: '指标类型不能为空' })
  type: MetricType;

  @IsEnum(MetricScope, { message: '指标范围必须是 personal 或 public' })
  @IsOptional()
  scope?: MetricScope = MetricScope.PERSONAL;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  codeRepoUrl?: string;

  @IsString()
  @IsOptional()
  codeBranch?: string = 'master';
}
