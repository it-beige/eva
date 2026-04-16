import { Injectable, HttpStatus } from '@nestjs/common';
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
  nextCursor: string | null;
}

@Injectable()
export class ObservabilityService {
  constructor(
    @InjectRepository(TraceLog)
    private readonly traceLogRepository: Repository<TraceLog>,
  ) {}

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

    // 时间范围筛选 - 默认当天
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const start = startTime ? new Date(startTime) : todayStart;
    const end = endTime ? new Date(endTime) : todayEnd;

    qb.where('trace.calledAt BETWEEN :start AND :end', { start, end });

    // ID搜索 - 模糊匹配 traceId/sessionId/nodeId/messageId
    if (idSearch) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('trace.traceId LIKE :idSearch', { idSearch: `%${idSearch}%` })
            .orWhere('trace.sessionId LIKE :idSearch', { idSearch: `%${idSearch}%` })
            .orWhere('trace.nodeId LIKE :idSearch', { idSearch: `%${idSearch}%` })
            .orWhere('trace.messageId LIKE :idSearch', { idSearch: `%${idSearch}%` });
        }),
      );
    }

    // 状态筛选
    if (status) {
      qb.andWhere('trace.status = :status', { status });
    }

    // 用户ID筛选
    if (userId) {
      qb.andWhere('trace.userId = :userId', { userId });
    }

    // 输入关键词筛选
    if (inputKeyword) {
      qb.andWhere('trace.input LIKE :inputKeyword', { inputKeyword: `%${inputKeyword}%` });
    }

    // 输出关键词筛选
    if (outputKeyword) {
      qb.andWhere('trace.output LIKE :outputKeyword', { outputKeyword: `%${outputKeyword}%` });
    }

    if (cursor) {
      const [cursorCalledAt, cursorId] = Buffer.from(cursor, 'base64')
        .toString('utf8')
        .split('|');
      if (cursorCalledAt && cursorId) {
        qb.andWhere(
          '(trace.calledAt < :cursorCalledAt OR (trace.calledAt = :cursorCalledAt AND trace.id < :cursorId))',
          {
            cursorCalledAt: new Date(cursorCalledAt),
            cursorId,
          },
        );
      }
    }

    const total = await qb.getCount();

    qb.orderBy('trace.calledAt', 'DESC')
      .addOrderBy('trace.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const list = await qb.getMany();
    const lastItem = list.at(-1);
    const nextCursor = lastItem
      ? Buffer.from(`${lastItem.calledAt.toISOString()}|${lastItem.id}`).toString(
          'base64',
        )
      : null;

    return {
      list,
      total,
      page,
      pageSize,
      nextCursor,
    };
  }

  async findOne(id: string): Promise<TraceLog> {
    const traceLog = await this.traceLogRepository.findOne({
      where: { id },
      relations: {
        application: true,
        user: true,
      },
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

  async findByTraceId(traceId: string): Promise<TraceLog | null> {
    return this.traceLogRepository.findOne({
      where: { traceId },
    });
  }

  async create(createTraceDto: CreateTraceDto): Promise<TraceLog> {
    const trace = this.traceLogRepository.create({
      ...createTraceDto,
      calledAt: createTraceDto.calledAt ? new Date(createTraceDto.calledAt) : new Date(),
    });
    return this.traceLogRepository.save(trace);
  }

  async getBehaviorLogs(traceId: string): Promise<TraceLog[]> {
    // 获取与指定 traceId 相关的所有行为日志
    // 这里可以根据 sessionId 或 userId 获取相关日志
    const trace = await this.findByTraceId(traceId);
    if (!trace) {
      return [];
    }

    const qb = this.traceLogRepository.createQueryBuilder('trace');
    
    if (trace.sessionId) {
      qb.where('trace.sessionId = :sessionId', { sessionId: trace.sessionId })
        .orWhere('trace.traceId = :traceId', { traceId });
    } else if (trace.userId) {
      qb.where('trace.userId = :userId', { userId: trace.userId })
        .andWhere('trace.calledAt BETWEEN :start AND :end', {
          start: new Date(new Date(trace.calledAt).getTime() - 5 * 60 * 1000), // 前后5分钟
          end: new Date(new Date(trace.calledAt).getTime() + 5 * 60 * 1000),
        });
    } else {
      qb.where('trace.traceId = :traceId', { traceId });
    }

    return qb.orderBy('trace.calledAt', 'ASC').getMany();
  }
}
