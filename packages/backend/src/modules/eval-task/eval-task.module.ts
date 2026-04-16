import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EvalTaskService } from './eval-task.service';
import { EvalTaskController } from './eval-task.controller';
import { EvalTaskGateway } from './eval-task.gateway';
import { EvalTaskProcessor } from './eval-task.processor';
import { EvalTask } from '../../database/entities/eval-task.entity';
import { EvalSet } from '../../database/entities/eval-set.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvalTask, EvalSet]),
    BullModule.registerQueue({
      name: 'eval-tasks',
    }),
  ],
  controllers: [EvalTaskController],
  providers: [EvalTaskService, EvalTaskGateway, EvalTaskProcessor],
  exports: [EvalTaskService],
})
export class EvalTaskModule {}
