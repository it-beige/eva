import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoEvalController } from './auto-eval.controller';
import { AutoEvalService } from './auto-eval.service';
import { AutoEval } from '../../database/entities/auto-eval.entity';
import { TraceLog } from '../../database/entities/trace-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AutoEval, TraceLog])],
  controllers: [AutoEvalController],
  providers: [AutoEvalService],
  exports: [AutoEvalService],
})
export class AutoEvalModule {}
