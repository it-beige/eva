import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AutoEvalStatus } from '@eva/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryAutoEvalDto extends PaginationQueryDto {
  @IsEnum(AutoEvalStatus, { message: '状态必须是 enabled 或 disabled' })
  @IsOptional()
  status?: AutoEvalStatus;

  @IsString()
  @IsOptional()
  keyword?: string;
}
