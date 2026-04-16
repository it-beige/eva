import { PartialType } from '@nestjs/mapped-types';
import { CreateEvalSetItemDto } from './create-eval-set-item.dto';

export class UpdateEvalSetItemDto extends PartialType(CreateEvalSetItemDto) {}
