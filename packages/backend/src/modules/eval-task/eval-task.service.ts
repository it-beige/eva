import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, DataSource } from 'typeorm';
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

/** 短 ID 字符集 */
const SHORT_ID_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
/** 短 ID 长度 */
const SHORT_ID_LENGTH = 6;
/** 短 ID 生成最大重试次数，防止无限循环 */
const SHORT_ID_MAX_ATTEMPTS = 10;

/**
 * 评测任务服务
 *
 * 核心职责：
 *  1. 任务 CRUD 与分页查询
 *  2. 任务创建时校验关联实体（评测集、应用）并入队
 *  3. 任务复制、中止、批量操作
 *  4. 供 Processor 调用的进度/状态更新接口
 */
@Injectable()
export class EvalTaskService {
  private readonly logger = new Logger(EvalTaskService.name);

  constructor(
    @InjectRepository(EvalTask)
    private readonly evalTaskRepository: Repository<EvalTask>,
    @InjectRepository(EvalSet)
    private readonly evalSetRepository: Repository<EvalSet>,
    @InjectRepository(AIApplication)
    private readonly applicationRepository: Repository<AIApplication>,
    @InjectQueue('eval-tasks')
    private readonly evalTaskQueue: Queue,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== 查询 ====================

  /** 分页查询任务列表 */
  async findAll(query: QueryEvalTaskDto): Promise<PaginatedResponseDto<EvalTask>> {
    const { page = 1, pageSize = 20, keyword, evalSetId, status, evalType } = query;

    const where: FindOptionsWhere<EvalTask> = {};

    if (keyword) where.name = Like(`%${keyword}%`);
    if (evalSetId) where.evalSetId = evalSetId;
    if (status) where.status = status;
    if (evalType) where.evalType = evalType as EvalType;

    const [items, total] = await this.evalTaskRepository.findAndCount({
      where,
      relations: { evalSet: true, application: true },
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

  /** 查询任务详情 */
  async findOne(id: string): Promise<EvalTask> {
    const task = await this.evalTaskRepository.findOne({
      where: { id },
      relations: { evalSet: true, application: true },
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

  // ==================== 写操作 ====================

  /**
   * 创建评测任务
   *
   * 流程：校验关联实体 → 生成唯一短 ID → 合并配置 → 持久化 → 入队
   */
  async create(dto: CreateEvalTaskDto, createdBy?: string): Promise<EvalTask> {
    // 关联实体校验
    if (dto.evalSetId) {
      await this.assertEntityExists(this.evalSetRepository, dto.evalSetId, '评测集');
    }
    if (dto.appId) {
      await this.assertEntityExists(this.applicationRepository, dto.appId, 'AI 应用');
    }

    const shortId = await this.generateUniqueShortId();

    // 合并音频配置到 config
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

    // 入队执行
    await this.enqueueTask(savedTask);

    return savedTask;
  }

  /**
   * 复制任务
   *
   * 基于原任务配置创建新任务，重新入队执行。
   */
  async copy(id: string, createdBy?: string): Promise<EvalTask> {
    const task = await this.findOne(id);
    const shortId = await this.generateUniqueShortId();

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
    await this.enqueueTask(savedTask);

    return savedTask;
  }

  /**
   * 中止任务
   *
   * 仅 PENDING / RUNNING 状态的任务可以中止。
   */
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

  /**
   * 获取任务日志
   *
   * TODO: 对接实际日志存储（如 ES / ClickHouse），当前为模拟数据
   */
  async getLogs(id: string): Promise<string[]> {
    const task = await this.findOne(id);
    const now = new Date().toISOString();

    const logs: string[] = [
      `[${now}] 任务 ${task.name} (${task.shortId}) 日志:`,
      `[${now}] 评测类型: ${task.evalType}`,
      `[${now}] 评测模式: ${task.evalMode || 'N/A'}`,
      `[${now}] 当前状态: ${task.status}`,
      `[${now}] 当前进度: ${task.progress.toFixed(2)}%`,
    ];

    const statusMessages: Partial<Record<EvalTaskStatus, string>> = {
      [EvalTaskStatus.RUNNING]: '正在执行评测...',
      [EvalTaskStatus.SUCCESS]: '评测执行成功',
      [EvalTaskStatus.FAILED]: '评测执行失败',
      [EvalTaskStatus.ABORTED]: '任务已中止',
    };

    const statusMsg = statusMessages[task.status];
    if (statusMsg) {
      logs.push(`[${now}] ${statusMsg}`);
    }

    return logs;
  }

  /**
   * 批量操作（中止 / 删除）
   *
   * 使用事务保证批量操作的原子性，避免部分成功部分失败的不一致状态。
   */
  async batchOperation(dto: BatchOperationDto): Promise<{ success: number; failed: number }> {
    if (!dto.ids?.length) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    await this.dataSource.transaction(async (manager) => {
      const taskRepo = manager.getRepository(EvalTask);

      for (const id of dto.ids) {
        try {
          if (dto.operation === BatchOperationType.ABORT) {
            await this.abort(id);
          } else if (dto.operation === BatchOperationType.DELETE) {
            await taskRepo.delete(id);
          }
          success++;
        } catch (error) {
          this.logger.warn(`批量操作失败 [id=${id}]: ${error instanceof Error ? error.message : String(error)}`);
          failed++;
        }
      }
    });

    return { success, failed };
  }

  // ==================== Processor 内部调用 ====================

  /** 更新任务进度 */
  async updateProgress(id: string, progress: number): Promise<void> {
    await this.evalTaskRepository.update(id, { progress });
  }

  /** 更新任务状态 */
  async updateStatus(id: string, status: EvalTaskStatus): Promise<void> {
    await this.evalTaskRepository.update(id, { status });
  }

  /** 更新执行摘要 */
  async updateExecutionSummary(
    id: string,
    summary: Record<string, unknown>,
  ): Promise<void> {
    const task = await this.evalTaskRepository.findOne({ where: { id } });
    if (!task) return;

    await this.evalTaskRepository.update(id, {
      config: {
        ...(task.config ?? {}),
        executionSummary: summary,
      },
    });
  }

  // ==================== 私有方法 ====================

  /**
   * 生成唯一短 ID
   *
   * 带最大重试次数保护，避免极端情况下的无限循环。
   */
  private async generateUniqueShortId(): Promise<string> {
    for (let attempt = 0; attempt < SHORT_ID_MAX_ATTEMPTS; attempt++) {
      const shortId = this.generateShortId();
      const exists = await this.evalTaskRepository.exists({ where: { shortId } });
      if (!exists) return shortId;
    }

    // 兜底：使用时间戳 + 随机数，保证唯一性
    this.logger.warn('短 ID 生成重试次数已达上限，使用时间戳兜底');
    return `${Date.now().toString(36)}`;
  }

  /** 生成 6 位随机短 ID */
  private generateShortId(): string {
    let result = '';
    for (let i = 0; i < SHORT_ID_LENGTH; i++) {
      result += SHORT_ID_CHARS.charAt(Math.floor(Math.random() * SHORT_ID_CHARS.length));
    }
    return result;
  }

  /**
   * 校验关联实体是否存在
   *
   * 通用方法，避免每个实体校验都写一套重复逻辑。
   */
  private async assertEntityExists<T extends { id: string }>(
    repository: Repository<T>,
    id: string,
    entityName: string,
  ): Promise<void> {
    const exists = await repository.exists({ where: { id } as FindOptionsWhere<T> });
    if (!exists) {
      const codeMap: Record<string, BusinessErrorCode> = {
        '评测集': BusinessErrorCode.EVAL_SET_NOT_FOUND,
        'AI 应用': BusinessErrorCode.APPLICATION_NOT_FOUND,
      };
      throw new BusinessException(
        codeMap[entityName] ?? BusinessErrorCode.RESOURCE_NOT_FOUND,
        `${entityName}不存在`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /** 将任务入队执行 */
  private async enqueueTask(task: EvalTask): Promise<void> {
    await this.evalTaskQueue.add(
      'execute',
      {
        taskId: task.id,
        evalType: task.evalType,
        config: task.config,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );
  }
}
