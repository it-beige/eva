import { PartialType } from '@nestjs/mapped-types';
import { CreateAutoEvalDto } from './create-auto-eval.dto';

export class UpdateAutoEvalDto extends PartialType(CreateAutoEvalDto) {}
