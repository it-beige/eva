import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryPromptDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}
