import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { TraceLog } from '../../database/entities/trace-log.entity';
import { BusinessErrorCode } from '@eva/shared';
import { QueryTraceDto } from './dto/query-trace.dto';
import { CreateTraceDto } from './dto/create-trace.dto';
import { BusinessException } from '../../common/errors/business.exception';

export interface TraceListResult {
  list: TraceLog[];
  total: number;
  page: number;
  pageSize: number;
  /** 游标分页标记，用于下一页查询 */
  nextCursor: string | null;
}

/**
 * 可观测性服务
 *
 * 职责：
 *  1. Trace 日志的查询（支持游标分页 + 偏移分页双模式）
 *  2. Trace 详情查询
 *  3. 行为日志关联查询
 *  4. Trace 写入
 *
 * 分页策略：
 *  - 有 cursor 时使用游标分页（高性能，适合无限滚动场景）
 *  - 无 cursor 时使用传统 offset 分页（适合跳页场景）
 *  - 两者不混用，避免结果不一致
 */
@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  constructor(
    @InjectRepository(TraceLog)
    private readonly traceLogRepository: Repository<TraceLog>,
  ) {}

  /**
   * 分页查询 Trace 列表
   *
   * 支持时间范围、ID 搜索、状态筛选、关键词搜索等多维度过滤。
   */
  async findAll(query: QueryTraceDto): Promise<TraceListResult> {
    const {
      startTime,
      endTime,
      idSearch,
      status,
      userId,
      inputKeyword,
      outputKeyword,
      page = 1,
      pageSize = 20,
      cursor,
    } = query;

    const qb = this.traceLogRepository.createQueryBuilder('trace');

    // ---- 时间范围筛选（默认当天） ----
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const start = startTime ? new Date(startTime) : todayStart;
    const end = endTime ? new Date(endTime) : todayEnd;

    qb.where('trace.calledAt BETWEEN :start AND :end', { start, end });

    // ---- ID 搜索（模糊匹配多个 ID 字段） ----
    if (idSearch) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('trace.traceId LIKE :idSearch', { idSearch: `%${idSearch}%` })
            .orWhere('trace.sessionId LIKE :idSearch', { idSearch: `%${idSearch}%` })
            .orWhere('trace.nodeId LIKE :idSearch', { idSearch: `%${idSearch}%` })
            .orWhere('trace.messageId LIKE :idSearch', { idSearch: `%${idSearch}%` });
        }),
      );
    }

    // ---- 精确筛选 ----
    if (status) {
      qb.andWhere('trace.status = :status', { status });
    }
    if (userId) {
      qb.andWhere('trace.userId = :userId', { userId });
    }

    // ---- 关键词搜索 ----
    if (inputKeyword) {
      qb.andWhere('trace.input LIKE :inputKeyword', { inputKeyword: `%${inputKeyword}%` });
    }
    if (outputKeyword) {
      qb.andWhere('trace.output LIKE :outputKeyword', { outputKeyword: `%${outputKeyword}%` });
    }

    // ---- 分页策略：游标 vs 偏移（二选一，不混用） ----
    const useCursor = !!cursor;

    if (useCursor) {
      const decoded = this.decodeCursor(cursor!);
      if (decoded) {
        qb.andWhere(
          '(trace.calledAt < :cursorCalledAt OR (trace.calledAt = :cursorCalledAt AND trace.id < :cursorId))',
          { cursorCalledAt: decoded.calledAt, cursorId: decoded.id },
        );
      }
    }

    // 获取总数（游标模式下可选跳过以提升性能，此处保留以兼容前端）
    const total = await qb.getCount();

    qb.orderBy('trace.calledAt', 'DESC')
      .addOrderBy('trace.id', 'DESC')
      .take(pageSize);

    // 仅偏移分页模式下使用 skip
    if (!useCursor) {
      qb.skip((page - 1) * pageSize);
    }

    const list = await qb.getMany();

    // 生成下一页游标
    const lastItem = list.at(-1);
    const nextCursor = lastItem
      ? Buffer.from(`${lastItem.calledAt.toISOString()}|${lastItem.id}`).toString('base64')
      : null;

    return {
      list,
      total,
      page,
      pageSize,
      nextCursor,
    };
  }

  /**
   * 查询 Trace 详情
   */
  async findOne(id: string): Promise<TraceLog> {
    const traceLog = await this.traceLogRepository.findOne({
      where: { id },
      relations: { application: true, user: true },
    });

    if (!traceLog) {
      throw new BusinessException(
        BusinessErrorCode.TRACE_NOT_FOUND,
        'Trace 不存在',
        HttpStatus.NOT_FOUND,
      );
    }

    return traceLog;
  }

  /** 根据 traceId 查询 */
  async findByTraceId(traceId: string): Promise<TraceLog | null> {
    return this.traceLogRepository.findOne({ where: { traceId } });
  }

  /** 创建 Trace 记录 */
  async create(createTraceDto: CreateTraceDto): Promise<TraceLog> {
    const trace = this.traceLogRepository.create({
      ...createTraceDto,
      calledAt: createTraceDto.calledAt ? new Date(createTraceDto.calledAt) : new Date(),
    });
    return this.traceLogRepository.save(trace);
  }

  /**
   * 获取行为日志
   *
   * 根据 sessionId 或 userId + 时间窗口关联查询相关 Trace。
   */
  async getBehaviorLogs(traceId: string): Promise<TraceLog[]> {
    const trace = await this.findByTraceId(traceId);
    if (!trace) {
      return [];
    }

    const qb = this.traceLogRepository.createQueryBuilder('trace');

    if (trace.sessionId) {
      // 同 session 下的所有 Trace
      qb.where('trace.sessionId = :sessionId', { sessionId: trace.sessionId })
        .orWhere('trace.traceId = :traceId', { traceId });
    } else if (trace.userId) {
      // 同用户前后 5 分钟内的 Trace
      const windowMs = 5 * 60 * 1000;
      qb.where('trace.userId = :userId', { userId: trace.userId })
        .andWhere('trace.calledAt BETWEEN :start AND :end', {
          start: new Date(new Date(trace.calledAt).getTime() - windowMs),
          end: new Date(new Date(trace.calledAt).getTime() + windowMs),
        });
    } else {
      qb.where('trace.traceId = :traceId', { traceId });
    }

    return qb.orderBy('trace.calledAt', 'ASC').getMany();
  }

  // ==================== 私有方法 ====================

  /** 解码游标 */
  private decodeCursor(cursor: string): { calledAt: Date; id: string } | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      const [calledAt, id] = decoded.split('|');
      if (calledAt && id) {
        return { calledAt: new Date(calledAt), id };
      }
      return null;
    } catch {
      return null;
    }
  }
}
