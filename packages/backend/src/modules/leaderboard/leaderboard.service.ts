import { Injectable } from '@nestjs/common';
import {
  QueryLeaderboardDto,
  LeaderboardItem,
  LeaderboardSummary,
  PaginatedLeaderboardResponse,
} from './dto/query-leaderboard.dto';

@Injectable()
export class LeaderboardService {
  /**
   * 获取排行榜数据
   */
  async findAll(dto: QueryLeaderboardDto): Promise<PaginatedLeaderboardResponse> {
    const { evalSetId, metricId, sortBy, order, page, pageSize } = dto;

    // 模拟数据，实际项目中会从数据库查询
    const mockData = this.generateMockData();
    
    // 过滤
    let filteredData = mockData;
    if (evalSetId) {
      filteredData = filteredData.filter((item) => item.evalSetId === evalSetId);
    }
    if (metricId) {
      filteredData = filteredData.filter((item) => item.metricId === metricId);
    }

    // 排序
    filteredData.sort((a, b) => {
      const aValue = sortBy === 'score' ? a.score : a.rank;
      const bValue = sortBy === 'score' ? b.score : b.rank;
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // 重新计算排名
    filteredData = filteredData.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // 分页
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const items = filteredData.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * 获取排行榜汇总统计
   */
  async getSummary(): Promise<LeaderboardSummary> {
    const mockData = this.generateMockData();
    
    const uniqueApps = new Set(mockData.map((item) => item.appId));
    const uniqueEvalSets = new Set(mockData.map((item) => item.evalSetId));
    
    const avgScore = mockData.length > 0
      ? mockData.reduce((sum, item) => sum + item.score, 0) / mockData.length
      : 0;

    // 找出得分最高的应用
    const topItem = mockData.reduce((top, item) => 
      item.score > top.score ? item : top, mockData[0]
    );

    return {
      totalApps: uniqueApps.size,
      totalEvalSets: uniqueEvalSets.size,
      avgScore: Math.round(avgScore * 100) / 100,
      topApp: topItem ? {
        id: topItem.appId,
        name: topItem.appName,
        score: topItem.score,
      } : undefined,
    };
  }

  /**
   * 生成模拟数据
   */
  private generateMockData(): LeaderboardItem[] {
    const apps = [
      { id: 'app-1', name: '智能客服助手', version: 'v1.2.0' },
      { id: 'app-2', name: '代码生成器', version: 'v2.0.1' },
      { id: 'app-3', name: '文档分析器', version: 'v1.5.3' },
      { id: 'app-4', name: '多轮对话系统', version: 'v3.1.0' },
      { id: 'app-5', name: '知识问答引擎', version: 'v2.2.1' },
      { id: 'app-6', name: '文本摘要工具', version: 'v1.0.5' },
      { id: 'app-7', name: '情感分析器', version: 'v1.8.0' },
      { id: 'app-8', name: '翻译助手', version: 'v2.5.2' },
    ];

    const evalSets = [
      { id: 'eval-1', name: '通用能力评测集' },
      { id: 'eval-2', name: '代码能力评测集' },
      { id: 'eval-3', name: '对话能力评测集' },
    ];

    const metrics = [
      { id: 'metric-1', name: '准确率' },
      { id: 'metric-2', name: 'F1分数' },
      { id: 'metric-3', name: 'BLEU' },
      { id: 'metric-4', name: 'ROUGE' },
    ];

    const data: LeaderboardItem[] = [];
    let rank = 1;

    for (const app of apps) {
      for (const evalSet of evalSets) {
        for (const metric of metrics) {
          // 随机生成分数 (60-100)
          const score = Math.round((60 + Math.random() * 40) * 100) / 100;
          
          data.push({
            rank,
            appId: app.id,
            appName: app.name,
            appVersion: app.version,
            evalSetId: evalSet.id,
            evalSetName: evalSet.name,
            metricId: metric.id,
            metricName: metric.name,
            score,
            lastEvalTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
          rank++;
        }
      }
    }

    return data;
  }
}
