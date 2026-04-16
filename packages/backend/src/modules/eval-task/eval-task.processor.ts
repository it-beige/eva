import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { EvalTaskService } from './eval-task.service';
import { EvalTaskGateway } from './eval-task.gateway';
import { EvalTaskStatus, EvalType } from '@eva/shared';
import { EvalEngineService } from './eval-engine.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import {
  EvalSetItem,
  LeaderboardEntry,
  TraceLog,
} from '../../database/entities';

interface EvalTaskJobData {
  taskId: string;
  evalType: EvalType;
  config?: Record<string, unknown>;
}

@Processor('eval-tasks')
export class EvalTaskProcessor {
  private readonly logger = new Logger(EvalTaskProcessor.name);

  constructor(
    private readonly evalTaskService: EvalTaskService,
    private readonly evalTaskGateway: EvalTaskGateway,
    private readonly evalEngineService: EvalEngineService,
    private readonly cacheService: CacheService,
    @InjectRepository(EvalSetItem)
    private readonly evalSetItemRepository: Repository<EvalSetItem>,
    @InjectRepository(LeaderboardEntry)
    private readonly leaderboardRepository: Repository<LeaderboardEntry>,
    @InjectRepository(TraceLog)
    private readonly traceLogRepository: Repository<TraceLog>,
  ) {}

  @Process('execute')
  async handleExecute(job: Job<EvalTaskJobData>) {
    const { taskId, evalType } = job.data;
    this.logger.log(`Processing task ${taskId}, type: ${evalType}`);

    // 更新状态为运行中
    await this.evalTaskService.updateStatus(taskId, EvalTaskStatus.RUNNING);
    this.evalTaskGateway.sendStatus(taskId, EvalTaskStatus.RUNNING);
    this.evalTaskGateway.sendLog(taskId, `[${new Date().toISOString()}] 任务开始执行`);

    try {
      const task = await this.evalTaskService.findOne(taskId);
      const items = await this.loadEvalItems(task.evalSetId);

      const targetItems =
        items.length > 0
          ? items
          : [
              this.evalSetItemRepository.create({
                id: `adhoc-${task.id}`,
                evalSetId: task.evalSetId ?? '',
                input: task.config ?? { taskName: task.name },
                output: null,
                metadata: { source: 'task-config' },
              }),
            ];

      const totalSteps = Math.max(targetItems.length, 1);
      for (let index = 0; index < totalSteps; index += 1) {
        const currentJob = await job.queue.getJob(job.id);
        if (!currentJob) {
          this.logger.log(`Task ${taskId} was removed from queue`);
          return;
        }

        const progress = Math.round((index / totalSteps) * 100);
        await this.evalTaskService.updateProgress(taskId, progress);
        this.evalTaskGateway.sendProgress(taskId, progress);
      }

      const execution = await this.evalEngineService.execute(task, targetItems);

      for (const result of execution.items) {
        await this.traceLogRepository.save(
          this.traceLogRepository.create({
            traceId: `${task.shortId}-${result.itemId}`,
            sessionId: task.id,
            appId: task.appId ?? null,
            userId: null,
            input: result.input,
            output: result.actualOutput,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            ttft: 0,
            status: result.score >= 0.5 ? 'success' : 'warning',
            sourceProject: 'eval-engine',
          }),
        );

        this.evalTaskGateway.sendLog(
          taskId,
          `[${new Date().toISOString()}] 数据项 ${result.itemId} 完成，得分 ${result.score}`,
        );
      }

      await this.persistLeaderboard(taskId, task, execution.summary.avgScore);
      await this.evalTaskService.updateExecutionSummary(taskId, execution.summary);

      // 更新状态为成功
      await this.evalTaskService.updateStatus(taskId, EvalTaskStatus.SUCCESS);
      await this.evalTaskService.updateProgress(taskId, 100);
      this.evalTaskGateway.sendStatus(taskId, EvalTaskStatus.SUCCESS);
      this.evalTaskGateway.sendProgress(taskId, 100);
      this.evalTaskGateway.sendLog(
        taskId,
        `[${new Date().toISOString()}] 任务执行成功，平均分 ${execution.summary.avgScore}，样本数 ${execution.summary.totalItems}`,
      );

      this.logger.log(`Task ${taskId} completed successfully`);
    } catch (error) {
      this.logger.error(`Task ${taskId} failed:`, error);
      
      // 更新状态为失败
      await this.evalTaskService.updateStatus(taskId, EvalTaskStatus.FAILED);
      this.evalTaskGateway.sendStatus(taskId, EvalTaskStatus.FAILED);
      this.evalTaskGateway.sendLog(
        taskId,
        `[${new Date().toISOString()}] 任务执行失败: ${error.message}`,
      );
      
      throw error;
    }
  }

  private async loadEvalItems(evalSetId: string | null): Promise<EvalSetItem[]> {
    if (!evalSetId) {
      return [];
    }

    return this.evalSetItemRepository.find({
      where: { evalSetId },
      order: { createdAt: 'ASC' },
      take: 20,
    });
  }

  private async persistLeaderboard(
    taskId: string,
    task: Awaited<ReturnType<EvalTaskService['findOne']>>,
    score: number,
  ): Promise<void> {
    if (!task.appId && !task.evalSetId) {
      return;
    }

    const existing = await this.leaderboardRepository.findOne({
      where: {
        appId: task.appId ?? null,
        evalSetId: task.evalSetId ?? null,
        metricId: null,
      },
    });

    if (existing) {
      existing.score = score;
      existing.rank = null;
      await this.leaderboardRepository.save(existing);
      return;
    }

    await this.leaderboardRepository.save(
      this.leaderboardRepository.create({
        appId: task.appId ?? null,
        evalSetId: task.evalSetId ?? null,
        metricId: null,
        score,
        rank: null,
      }),
    );

    this.evalTaskGateway.sendLog(
      taskId,
      `[${new Date().toISOString()}] Leaderboard 已更新`,
    );
    await this.cacheService.del('leaderboard:summary');
    await this.cacheService.delByPrefix('leaderboard:list:');
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`Completed job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Failed job ${job.id}:`, err);
  }
}
