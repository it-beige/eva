import { IsOptional, IsEnum, IsString } from 'class-validator';
import { EvalSetType } from '@eva/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryEvalSetDto extends PaginationQueryDto {
  @IsEnum(EvalSetType)
  @IsOptional()
  type?: EvalSetType;

  @IsString()
  @IsOptional()
  keyword?: string;
}
