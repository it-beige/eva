import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { LeaderboardEntry } from '../../database/entities/leaderboard-entry.entity';
import {
  QueryLeaderboardDto,
  LeaderboardItem,
  LeaderboardSummary,
  PaginatedLeaderboardResponse,
} from './dto/query-leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(LeaderboardEntry)
    private readonly leaderboardRepository: Repository<LeaderboardEntry>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 获取排行榜数据
   */
  async findAll(dto: QueryLeaderboardDto): Promise<PaginatedLeaderboardResponse> {
    const cacheKey = `leaderboard:list:${JSON.stringify(dto)}`;
    return this.cacheService.wrap(cacheKey, 120, async () => {
      const { evalSetId, metricId, sortBy, order, page, pageSize } = dto;
      const qb = this.leaderboardRepository
        .createQueryBuilder('entry')
        .leftJoinAndSelect('entry.application', 'application')
        .leftJoinAndSelect('entry.evalSet', 'evalSet')
        .leftJoinAndSelect('entry.metric', 'metric');

      if (evalSetId) {
        qb.andWhere('entry.evalSetId = :evalSetId', { evalSetId });
      }
      if (metricId) {
        qb.andWhere('entry.metricId = :metricId', { metricId });
      }

      qb.orderBy(
        sortBy === 'rank' ? 'entry.rank' : 'entry.score',
        order.toUpperCase() as 'ASC' | 'DESC',
      )
        .addOrderBy('entry.updatedAt', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize);

      const [entries, total] = await qb.getManyAndCount();
      const items = entries.map((entry, index) => this.toLeaderboardItem(entry, index));

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    });
  }

  /**
   * 获取排行榜汇总统计
   */
  async getSummary(): Promise<LeaderboardSummary> {
    return this.cacheService.wrap('leaderboard:summary', 120, async () => {
      const entries = await this.leaderboardRepository.find({
        relations: {
          application: true,
          evalSet: true,
        },
      });

      const uniqueApps = new Set(entries.map((item) => item.appId).filter(Boolean));
      const uniqueEvalSets = new Set(entries.map((item) => item.evalSetId).filter(Boolean));

      const avgScore =
        entries.length > 0
          ? entries.reduce((sum, item) => sum + item.score, 0) / entries.length
          : 0;

      const topEntry = [...entries].sort((left, right) => right.score - left.score)[0];

      return {
        totalApps: uniqueApps.size,
        totalEvalSets: uniqueEvalSets.size,
        avgScore: Math.round(avgScore * 100) / 100,
        topApp:
          topEntry && topEntry.application
            ? {
                id: topEntry.application.id,
                name: topEntry.application.name,
                score: topEntry.score,
              }
            : undefined,
      };
    });
  }

  async invalidateCaches(): Promise<void> {
    await this.cacheService.del('leaderboard:summary');
    await this.cacheService.delByPrefix('leaderboard:list:');
  }

  private toLeaderboardItem(
    entry: LeaderboardEntry,
    index: number,
  ): LeaderboardItem {
    return {
      rank: entry.rank ?? index + 1,
      appId: entry.appId ?? 'unknown',
      appName: entry.application?.name ?? '未命名应用',
      appVersion: entry.application?.latestVersion ?? 'latest',
      evalSetId: entry.evalSetId ?? 'unknown',
      evalSetName: entry.evalSet?.name ?? '未命名评测集',
      metricId: entry.metricId ?? 'overall',
      metricName: entry.metric?.name ?? '综合得分',
      score: entry.score,
      lastEvalTime: entry.updatedAt.toISOString(),
    };
  }
}
