import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, DeepPartial, FindOptionsWhere } from 'typeorm';
import { AutoEval } from '../../database/entities/auto-eval.entity';
import { TraceLog } from '../../database/entities/trace-log.entity';
import { CreateAutoEvalDto } from './dto/create-auto-eval.dto';
import { UpdateAutoEvalDto } from './dto/update-auto-eval.dto';
import { QueryAutoEvalDto } from './dto/query-auto-eval.dto';
import { DebugFilterDto, DebugEvalDto } from './dto/debug-auto-eval.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { AutoEvalStatus } from '@eva/shared';

export interface DebugFilterResult {
  traceId: string;
  duration: number;
  calledAt: Date;
}

export interface DebugEvalResult {
  input: string;
  output: string;
  metrics: Array<{
    metricId: string;
    metricName: string;
    score: number;
  }>;
}

/**
 * 允许在过滤条件中使用的字段白名单
 *
 * 防止 SQL 注入：动态字段名必须在白名单内才能拼入查询。
 */
const ALLOWED_FILTER_FIELDS = new Set([
  'traceId',
  'sessionId',
  'appId',
  'userId',
  'status',
  'input',
  'output',
  'sourceProject',
  'inputTokens',
  'outputTokens',
  'ttft',
]);

/** 操作符到 SQL 片段的映射 */
const OPERATOR_SQL_MAP: Record<string, string> = {
  equals: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
};

/**
 * 自动化评测服务
 *
 * 职责：
 *  1. 自动化评测规则的 CRUD
 *  2. 调试过滤（debugFilter）：根据时间范围 + 过滤条件 + 采样率筛选 Trace
 *  3. 调试评测（debugEval）：对筛选出的 Trace 执行评测（当前为模拟）
 */
@Injectable()
export class AutoEvalService {
  private readonly logger = new Logger(AutoEvalService.name);

  constructor(
    @InjectRepository(AutoEval)
    private readonly autoEvalRepository: Repository<AutoEval>,
    @InjectRepository(TraceLog)
    private readonly traceLogRepository: Repository<TraceLog>,
  ) {}

  // ==================== CRUD ====================

  /** 分页查询自动化评测规则 */
  async findAll(
    query: QueryAutoEvalDto,
  ): Promise<PaginatedResponseDto<AutoEval>> {
    const { page, pageSize, status, keyword } = query;

    const where: FindOptionsWhere<AutoEval> = {};

    if (status) where.status = status;
    if (keyword) where.name = Like(`%${keyword}%`);

    const [items, total] = await this.autoEvalRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  /** 查询单个规则详情 */
  async findOne(id: string): Promise<AutoEval> {
    const autoEval = await this.autoEvalRepository.findOne({
      where: { id },
    });

    if (!autoEval) {
      throw new NotFoundException(`自动化评测规则 ${id} 不存在`);
    }

    return autoEval;
  }

  /** 创建自动化评测规则 */
  async create(
    createDto: CreateAutoEvalDto,
    userId?: string,
    userName?: string,
  ): Promise<AutoEval> {
    this.validateSampleRate(createDto.sampleRate);

    const autoEval = this.autoEvalRepository.create({
      ...createDto,
      filterRules:
        (createDto.filterRules as unknown as Record<string, unknown>) ?? null,
      metricIds: createDto.metricIds ?? [],
      createdBy: userName || userId || null,
    } as DeepPartial<AutoEval>);

    return this.autoEvalRepository.save(autoEval);
  }

  /** 更新自动化评测规则 */
  async update(
    id: string,
    updateDto: UpdateAutoEvalDto,
    userId?: string,
    userName?: string,
  ): Promise<AutoEval> {
    const autoEval = await this.findOne(id);

    if (updateDto.sampleRate !== undefined) {
      this.validateSampleRate(updateDto.sampleRate);
    }

    const updated = this.autoEvalRepository.merge(
      autoEval,
      {
        ...updateDto,
        filterRules:
          updateDto.filterRules === undefined
            ? autoEval.filterRules
            : ((updateDto.filterRules as unknown as Record<string, unknown>) ??
              null),
        metricIds: updateDto.metricIds ?? autoEval.metricIds,
        createdBy: userName || userId || autoEval.createdBy,
      } as DeepPartial<AutoEval>,
    );

    return this.autoEvalRepository.save(updated);
  }

  /** 删除单个规则 */
  async remove(id: string): Promise<void> {
    const autoEval = await this.findOne(id);
    await this.autoEvalRepository.remove(autoEval);
  }

  /** 批量删除规则 */
  async removeMany(ids: string[]): Promise<void> {
    if (!ids?.length) return;
    await this.autoEvalRepository.delete(ids);
  }

  // ==================== 调试功能 ====================

  /**
   * 调试过滤
   *
   * 根据时间范围、过滤条件、采样率筛选 Trace 记录。
   * 过滤条件中的字段名必须在白名单内，防止 SQL 注入。
   */
  async debugFilter(
    debugDto: DebugFilterDto,
  ): Promise<DebugFilterResult[]> {
    const { startTime, endTime, filterRules, sampleRate } = debugDto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const qb = this.traceLogRepository.createQueryBuilder('trace');
    qb.where('trace.calledAt BETWEEN :start AND :end', { start, end });

    // 应用过滤规则（带字段白名单校验）
    if (filterRules?.conditions?.length) {
      for (const [index, condition] of filterRules.conditions.entries()) {
        // ---- SQL 注入防护：字段名白名单校验 ----
        if (!ALLOWED_FILTER_FIELDS.has(condition.field)) {
          this.logger.warn(`过滤条件包含非法字段: ${condition.field}，已跳过`);
          continue;
        }

        const paramName = `value${index}`;
        const fieldRef = `trace.${condition.field}`;

        // LIKE 类操作符
        if (condition.operator === 'contains') {
          qb.andWhere(`${fieldRef} LIKE :${paramName}`, {
            [paramName]: `%${condition.value}%`,
          });
        } else if (condition.operator === 'startsWith') {
          qb.andWhere(`${fieldRef} LIKE :${paramName}`, {
            [paramName]: `${condition.value}%`,
          });
        } else if (condition.operator === 'endsWith') {
          qb.andWhere(`${fieldRef} LIKE :${paramName}`, {
            [paramName]: `%${condition.value}`,
          });
        } else {
          // 比较类操作符
          const sqlOp = OPERATOR_SQL_MAP[condition.operator];
          if (sqlOp) {
            qb.andWhere(`${fieldRef} ${sqlOp} :${paramName}`, {
              [paramName]: condition.value,
            });
          }
        }
      }
    }

    // 采样：使用随机排序
    if (sampleRate !== undefined && sampleRate < 100) {
      qb.orderBy('RANDOM()');
    } else {
      qb.orderBy('trace.calledAt', 'DESC');
    }

    qb.take(50);

    const traces = await qb.getMany();

    // 按采样率截取结果
    let results = traces;
    if (sampleRate !== undefined && sampleRate < 100) {
      const sampleCount = Math.max(1, Math.ceil(traces.length * (sampleRate / 100)));
      results = traces.slice(0, sampleCount);
    }

    return results.map((trace) => ({
      traceId: trace.traceId,
      duration: trace.ttft || 0,
      calledAt: trace.calledAt,
    }));
  }

  /**
   * 调试评测
   *
   * TODO: 对接实际评测引擎，当前为模拟数据
   */
  async debugEval(debugDto: DebugEvalDto): Promise<DebugEvalResult[]> {
    const { startTime, endTime, filterRules, sampleRate, traceId } = debugDto;

    // 指定 traceId 时直接查询
    if (traceId) {
      const trace = await this.traceLogRepository.findOne({
        where: { traceId },
      });

      if (!trace) {
        throw new NotFoundException(`Trace ${traceId} 不存在`);
      }

      return [
        {
          input: trace.input || '',
          output: trace.output || '',
          metrics: [
            { metricId: 'mock-1', metricName: '准确性', score: 0.85 },
            { metricId: 'mock-2', metricName: '相关性', score: 0.92 },
          ],
        },
      ];
    }

    // 先过滤，再评测
    const filterResults = await this.debugFilter({
      startTime,
      endTime,
      filterRules,
      sampleRate,
    });

    if (filterResults.length === 0) {
      return [];
    }

    // 取前 5 条进行评测演示
    const traceIds = filterResults.slice(0, 5).map((r) => r.traceId);
    const traces = await this.traceLogRepository.find({
      where: { traceId: In(traceIds) },
    });

    return traces.map((trace) => ({
      input: trace.input || '',
      output: trace.output || '',
      metrics: [
        { metricId: 'mock-1', metricName: '准确性', score: Math.random() },
        { metricId: 'mock-2', metricName: '相关性', score: Math.random() },
      ],
    }));
  }

  // ==================== 私有方法 ====================

  /** 校验采样率合法性 */
  private validateSampleRate(sampleRate: number): void {
    if (sampleRate < 0 || sampleRate > 100) {
      throw new BadRequestException('采样率必须在 0-100 之间');
    }
  }
}
