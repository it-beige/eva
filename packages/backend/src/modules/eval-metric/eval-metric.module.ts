import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvalMetricService } from './eval-metric.service';
import { EvalMetricController } from './eval-metric.controller';
import { EvalMetric } from '../../database/entities/eval-metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvalMetric])],
  controllers: [EvalMetricController],
  providers: [EvalMetricService],
  exports: [EvalMetricService],
})
export class EvalMetricModule {}
