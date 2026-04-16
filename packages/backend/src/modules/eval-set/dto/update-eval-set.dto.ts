import { PartialType } from '@nestjs/mapped-types';
import { CreateEvalSetDto } from './create-eval-set.dto';

export class UpdateEvalSetDto extends PartialType(CreateEvalSetDto) {}
