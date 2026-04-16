import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EvalTaskService } from './eval-task.service';
import { EvalTaskGateway } from './eval-task.gateway';
import { EvalTaskStatus, EvalType } from '@eva/shared';

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
  ) {}

  @Process('execute')
  async handleExecute(job: Job<EvalTaskJobData>) {
    const { taskId, evalType, config } = job.data;
    this.logger.log(`Processing task ${taskId}, type: ${evalType}`);

    // 更新状态为运行中
    await this.evalTaskService.updateStatus(taskId, EvalTaskStatus.RUNNING);
    this.evalTaskGateway.sendStatus(taskId, EvalTaskStatus.RUNNING);
    this.evalTaskGateway.sendLog(taskId, `[${new Date().toISOString()}] 任务开始执行`);

    try {
      // 模拟评测执行过程
      const totalSteps = 10;
      for (let step = 1; step <= totalSteps; step++) {
        // 检查任务是否被取消
        const currentJob = await job.queue.getJob(job.id);
        if (!currentJob) {
          this.logger.log(`Task ${taskId} was removed from queue`);
          return;
        }

        const progress = (step / totalSteps) * 100;
        
        // 更新进度
        await this.evalTaskService.updateProgress(taskId, progress);
        this.evalTaskGateway.sendProgress(taskId, progress);
        
        // 发送日志
        this.evalTaskGateway.sendLog(
          taskId,
          `[${new Date().toISOString()}] 执行步骤 ${step}/${totalSteps}, 进度: ${progress.toFixed(2)}%`,
        );

        // 模拟处理时间
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 根据评测类型模拟不同的结果
      const shouldFail = Math.random() < 0.1; // 10% 失败率
      
      if (shouldFail) {
        throw new Error('模拟评测执行失败');
      }

      // 更新状态为成功
      await this.evalTaskService.updateStatus(taskId, EvalTaskStatus.SUCCESS);
      await this.evalTaskService.updateProgress(taskId, 100);
      this.evalTaskGateway.sendStatus(taskId, EvalTaskStatus.SUCCESS);
      this.evalTaskGateway.sendProgress(taskId, 100);
      this.evalTaskGateway.sendLog(taskId, `[${new Date().toISOString()}] 任务执行成功`);

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
