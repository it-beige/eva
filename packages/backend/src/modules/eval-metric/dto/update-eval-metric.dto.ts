import { PartialType } from '@nestjs/mapped-types';
import { CreateEvalMetricDto } from './create-eval-metric.dto';

export class UpdateEvalMetricDto extends PartialType(CreateEvalMetricDto) {}
