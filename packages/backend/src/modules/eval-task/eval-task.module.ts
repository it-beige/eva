import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EvalTaskService } from './eval-task.service';
import { EvalTaskController } from './eval-task.controller';
import { EvalTaskGateway } from './eval-task.gateway';
import { EvalTaskProcessor } from './eval-task.processor';
import { EvalEngineService } from './eval-engine.service';
import { EvalTask } from '../../database/entities/eval-task.entity';
import { EvalSet } from '../../database/entities/eval-set.entity';
import { AIApplication } from '../../database/entities/ai-application.entity';
import { EvalSetItem } from '../../database/entities/eval-set-item.entity';
import { LeaderboardEntry } from '../../database/entities/leaderboard-entry.entity';
import { TraceLog } from '../../database/entities/trace-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvalTask,
      EvalSet,
      AIApplication,
      EvalSetItem,
      LeaderboardEntry,
      TraceLog,
    ]),
    BullModule.registerQueue({
      name: 'eval-tasks',
    }),
  ],
  controllers: [EvalTaskController],
  providers: [
    EvalTaskService,
    EvalTaskGateway,
    EvalTaskProcessor,
    EvalEngineService,
  ],
  exports: [EvalTaskService],
})
export class EvalTaskModule {}
