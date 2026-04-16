import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MetricType, MetricScope } from '@eva/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryEvalMetricDto extends PaginationQueryDto {
  @IsEnum(MetricScope, { message: '指标范围必须是 personal 或 public' })
  @IsOptional()
  scope?: MetricScope;

  @IsEnum(MetricType, { message: '指标类型必须是 llm 或 code' })
  @IsOptional()
  type?: MetricType;

  @IsString()
  @IsOptional()
  keyword?: string;
}
