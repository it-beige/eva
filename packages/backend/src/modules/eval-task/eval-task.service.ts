import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EvalTask } from '../../database/entities/eval-task.entity';
import { EvalSet } from '../../database/entities/eval-set.entity';
import { AIApplication } from '../../database/entities/ai-application.entity';
import {
  BusinessErrorCode,
  EvalTaskStatus,
  EvalType,
} from '@eva/shared';
import {
  CreateEvalTaskDto,
  QueryEvalTaskDto,
  BatchOperationDto,
  BatchOperationType,
} from './dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { BusinessException } from '../../common/errors/business.exception';

@Injectable()
export class EvalTaskService {
  constructor(
    @InjectRepository(EvalTask)
    private readonly evalTaskRepository: Repository<EvalTask>,
    @InjectRepository(EvalSet)
    private readonly evalSetRepository: Repository<EvalSet>,
    @InjectRepository(AIApplication)
    private readonly applicationRepository: Repository<AIApplication>,
    @InjectQueue('eval-tasks')
    private readonly evalTaskQueue: Queue,
  ) {}

  // 生成6位短ID
  private generateShortId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 获取任务列表
  async findAll(query: QueryEvalTaskDto): Promise<PaginatedResponseDto<EvalTask>> {
    const { page = 1, pageSize = 20, keyword, evalSetId, status, evalType } = query;

    const where: any = {};

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    if (evalSetId) {
      where.evalSetId = evalSetId;
    }

    if (status) {
      where.status = status;
    }

    if (evalType) {
      where.evalType = evalType;
    }

    const [items, total] = await this.evalTaskRepository.findAndCount({
      where,
      relations: {
        evalSet: true,
        application: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取任务详情
  async findOne(id: string): Promise<EvalTask> {
    const task = await this.evalTaskRepository.findOne({
      where: { id },
      relations: {
        evalSet: true,
        application: true,
      },
    });
    if (!task) {
      throw new BusinessException(
        BusinessErrorCode.TASK_NOT_FOUND,
        '评测任务不存在',
        HttpStatus.NOT_FOUND,
      );
    }
    return task;
  }

  // 创建任务
  async create(dto: CreateEvalTaskDto, createdBy?: string): Promise<EvalTask> {
    if (dto.evalSetId) {
      const evalSet = await this.evalSetRepository.findOne({
        where: { id: dto.evalSetId },
      });

      if (!evalSet) {
        throw new BusinessException(
          BusinessErrorCode.EVAL_SET_NOT_FOUND,
          '评测集不存在',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    if (dto.appId) {
      const application = await this.applicationRepository.findOne({
        where: { id: dto.appId },
      });

      if (!application) {
        throw new BusinessException(
          BusinessErrorCode.APPLICATION_NOT_FOUND,
          'AI 应用不存在',
          HttpStatus.NOT_FOUND,
        );
      }
    }

    // 生成唯一的短ID
    let shortId = this.generateShortId();
    let existing = await this.evalTaskRepository.findOne({ where: { shortId } });
    while (existing) {
      shortId = this.generateShortId();
      existing = await this.evalTaskRepository.findOne({ where: { shortId } });
    }

    // 合并音频配置到config
    let config = dto.config || {};
    if (dto.evalType === EvalType.AUDIO && dto.audioConfig) {
      config = {
        ...config,
        datasetId: dto.audioConfig.datasetId,
        configFileId: dto.audioConfig.configFileId,
        configInfo: dto.audioConfig.configInfo,
      };
    }

    const task = this.evalTaskRepository.create({
      ...dto,
      shortId,
      status: EvalTaskStatus.PENDING,
      progress: 0,
      config,
      createdBy,
    });

    const savedTask = await this.evalTaskRepository.save(task);

    // 添加到Bull队列
    await this.evalTaskQueue.add('execute', {
      taskId: savedTask.id,
      evalType: savedTask.evalType,
      config: savedTask.config,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return savedTask;
  }

  // 复制任务
  async copy(id: string, createdBy?: string): Promise<EvalTask> {
    const task = await this.findOne(id);
    
    // 生成新的短ID
    let shortId = this.generateShortId();
    let existing = await this.evalTaskRepository.findOne({ where: { shortId } });
    while (existing) {
      shortId = this.generateShortId();
      existing = await this.evalTaskRepository.findOne({ where: { shortId } });
    }

    const newTask = this.evalTaskRepository.create({
      name: `${task.name} (复制)`,
      shortId,
      status: EvalTaskStatus.PENDING,
      progress: 0,
      evalType: task.evalType,
      evalMode: task.evalMode,
      maxConcurrency: task.maxConcurrency,
      evalSetId: task.evalSetId,
      taskGroupId: task.taskGroupId,
      evalModelId: task.evalModelId,
      appId: task.appId,
      appVersion: task.appVersion,
      config: task.config,
      createdBy,
    });

    const savedTask = await this.evalTaskRepository.save(newTask);

    // 添加到Bull队列
    await this.evalTaskQueue.add('execute', {
      taskId: savedTask.id,
      evalType: savedTask.evalType,
      config: savedTask.config,
    });

    return savedTask;
  }

  // 中止任务
  async abort(id: string): Promise<EvalTask> {
    const task = await this.findOne(id);

    if (task.status !== EvalTaskStatus.RUNNING && task.status !== EvalTaskStatus.PENDING) {
      return task;
    }

    // 从队列中移除
    const jobs = await this.evalTaskQueue.getJobs(['waiting', 'active', 'delayed']);
    const job = jobs.find((j) => j.data.taskId === id);
    if (job) {
      await job.remove();
    }

    task.status = EvalTaskStatus.ABORTED;
    return this.evalTaskRepository.save(task);
  }

  // 获取任务日志
  async getLogs(id: string): Promise<string[]> {
    const task = await this.findOne(id);
    
    // 模拟日志数据，实际应该从日志存储中获取
    const logs: string[] = [];
    const now = new Date();
    
    logs.push(`[${now.toISOString()}] 任务 ${task.name} (${task.shortId}) 日志:`);
    logs.push(`[${now.toISOString()}] 评测类型: ${task.evalType}`);
    logs.push(`[${now.toISOString()}] 评测模式: ${task.evalMode || 'N/A'}`);
    logs.push(`[${now.toISOString()}] 当前状态: ${task.status}`);
    logs.push(`[${now.toISOString()}] 当前进度: ${task.progress.toFixed(2)}%`);
    
    if (task.status === EvalTaskStatus.RUNNING) {
      logs.push(`[${now.toISOString()}] 正在执行评测...`);
    } else if (task.status === EvalTaskStatus.SUCCESS) {
      logs.push(`[${now.toISOString()}] 评测执行成功`);
    } else if (task.status === EvalTaskStatus.FAILED) {
      logs.push(`[${now.toISOString()}] 评测执行失败`);
    } else if (task.status === EvalTaskStatus.ABORTED) {
      logs.push(`[${now.toISOString()}] 任务已中止`);
    }

    return logs;
  }

  // 批量操作
  async batchOperation(dto: BatchOperationDto): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of dto.ids) {
      try {
        if (dto.operation === BatchOperationType.ABORT) {
          await this.abort(id);
        } else if (dto.operation === BatchOperationType.DELETE) {
          await this.evalTaskRepository.delete(id);
        }
        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  // 更新任务进度（供Processor调用）
  async updateProgress(id: string, progress: number): Promise<void> {
    await this.evalTaskRepository.update(id, { progress });
  }

  // 更新任务状态（供Processor调用）
  async updateStatus(id: string, status: EvalTaskStatus): Promise<void> {
    await this.evalTaskRepository.update(id, { status });
  }

  async updateExecutionSummary(
    id: string,
    summary: Record<string, unknown>,
  ): Promise<void> {
    const task = await this.evalTaskRepository.findOne({
      where: { id },
    });

    if (!task) {
      return;
    }

    await this.evalTaskRepository.update(id, {
      config: {
        ...(task.config ?? {}),
        executionSummary: summary,
      },
    });
  }
}
