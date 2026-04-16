import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, DeepPartial } from 'typeorm';
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

@Injectable()
export class AutoEvalService {
  constructor(
    @InjectRepository(AutoEval)
    private readonly autoEvalRepository: Repository<AutoEval>,
    @InjectRepository(TraceLog)
    private readonly traceLogRepository: Repository<TraceLog>,
  ) {}

  async findAll(
    query: QueryAutoEvalDto,
  ): Promise<PaginatedResponseDto<AutoEval>> {
    const { page, pageSize, status, keyword } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    const [items, total] = await this.autoEvalRepository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return PaginatedResponseDto.create(items, total, page, pageSize);
  }

  async findOne(id: string): Promise<AutoEval> {
    const autoEval = await this.autoEvalRepository.findOne({
      where: { id },
    });

    if (!autoEval) {
      throw new NotFoundException(`自动化评测规则 ${id} 不存在`);
    }

    return autoEval;
  }

  async create(
    createDto: CreateAutoEvalDto,
    userId?: string,
    userName?: string,
  ): Promise<AutoEval> {
    // 验证采样率
    if (createDto.sampleRate < 0 || createDto.sampleRate > 100) {
      throw new BadRequestException('采样率必须在 0-100 之间');
    }

    const autoEval = this.autoEvalRepository.create({
      ...createDto,
      filterRules:
        (createDto.filterRules as unknown as Record<string, unknown>) ?? null,
      metricIds: createDto.metricIds ?? [],
      createdBy: userName || userId || null,
    } as DeepPartial<AutoEval>);

    return this.autoEvalRepository.save(autoEval);
  }

  async update(
    id: string,
    updateDto: UpdateAutoEvalDto,
    userId?: string,
    userName?: string,
  ): Promise<AutoEval> {
    const autoEval = await this.findOne(id);

    // 验证采样率
    if (
      updateDto.sampleRate !== undefined &&
      (updateDto.sampleRate < 0 || updateDto.sampleRate > 100)
    ) {
      throw new BadRequestException('采样率必须在 0-100 之间');
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

  async remove(id: string): Promise<void> {
    const autoEval = await this.findOne(id);
    await this.autoEvalRepository.remove(autoEval);
  }

  async removeMany(ids: string[]): Promise<void> {
    await this.autoEvalRepository.delete(ids);
  }

  async debugFilter(
    debugDto: DebugFilterDto,
  ): Promise<DebugFilterResult[]> {
    const { startTime, endTime, filterRules, sampleRate } = debugDto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 构建基础查询
    const qb = this.traceLogRepository.createQueryBuilder('trace');
    qb.where('trace.calledAt BETWEEN :start AND :end', { start, end });

    // 应用过滤规则
    if (filterRules?.conditions && filterRules.conditions.length > 0) {
      filterRules.conditions.forEach((condition, index) => {
        const paramName = `value${index}`;
        switch (condition.operator) {
          case 'equals':
            qb.andWhere(`trace.${condition.field} = :${paramName}`, {
              [paramName]: condition.value,
            });
            break;
          case 'contains':
            qb.andWhere(`trace.${condition.field} LIKE :${paramName}`, {
              [paramName]: `%${condition.value}%`,
            });
            break;
          case 'startsWith':
            qb.andWhere(`trace.${condition.field} LIKE :${paramName}`, {
              [paramName]: `${condition.value}%`,
            });
            break;
          case 'endsWith':
            qb.andWhere(`trace.${condition.field} LIKE :${paramName}`, {
              [paramName]: `%${condition.value}`,
            });
            break;
          case 'gt':
            qb.andWhere(`trace.${condition.field} > :${paramName}`, {
              [paramName]: condition.value,
            });
            break;
          case 'gte':
            qb.andWhere(`trace.${condition.field} >= :${paramName}`, {
              [paramName]: condition.value,
            });
            break;
          case 'lt':
            qb.andWhere(`trace.${condition.field} < :${paramName}`, {
              [paramName]: condition.value,
            });
            break;
          case 'lte':
            qb.andWhere(`trace.${condition.field} <= :${paramName}`, {
              [paramName]: condition.value,
            });
            break;
          default:
            break;
        }
      });
    }

    // 应用采样率 - 使用随机采样
    if (sampleRate !== undefined && sampleRate < 100) {
      qb.orderBy('RANDOM()');
    } else {
      qb.orderBy('trace.calledAt', 'DESC');
    }

    // 限制返回数量
    qb.take(50);

    const traces = await qb.getMany();

    // 应用采样率过滤
    let results = traces;
    if (sampleRate !== undefined && sampleRate < 100) {
      const sampleCount = Math.ceil(traces.length * (sampleRate / 100));
      results = traces.slice(0, sampleCount);
    }

    return results.map((trace) => ({
      traceId: trace.traceId,
      duration: trace.ttft || 0,
      calledAt: trace.calledAt,
    }));
  }

  async debugEval(debugDto: DebugEvalDto): Promise<DebugEvalResult[]> {
    const { startTime, endTime, filterRules, sampleRate, traceId } = debugDto;

    // 如果指定了 traceId，直接查询该 trace
    if (traceId) {
      const trace = await this.traceLogRepository.findOne({
        where: { traceId },
      });

      if (!trace) {
        throw new NotFoundException(`Trace ${traceId} 不存在`);
      }

      // 模拟评测结果
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

    // 否则先执行过滤，再对结果进行评测
    const filterResults = await this.debugFilter({
      startTime,
      endTime,
      filterRules,
      sampleRate,
    });

    if (filterResults.length === 0) {
      return [];
    }

    // 获取前5条进行评测演示
    const traceIds = filterResults.slice(0, 5).map((r) => r.traceId);
    const traces = await this.traceLogRepository.find({
      where: { traceId: In(traceIds) },
    });

    // 模拟评测结果
    return traces.map((trace) => ({
      input: trace.input || '',
      output: trace.output || '',
      metrics: [
        { metricId: 'mock-1', metricName: '准确性', score: Math.random() },
        { metricId: 'mock-2', metricName: '相关性', score: Math.random() },
      ],
    }));
  }
}
