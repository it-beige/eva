import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryLeaderboardDto {
  @IsString()
  @IsOptional()
  evalSetId?: string;

  @IsString()
  @IsOptional()
  metricId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['score', 'rank'])
  sortBy?: 'score' | 'rank' = 'score';

  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;
}

export interface LeaderboardItem {
  rank: number;
  appId: string;
  appName: string;
  appVersion: string;
  evalSetId: string;
  evalSetName: string;
  metricId: string;
  metricName: string;
  score: number;
  lastEvalTime: string;
}

export interface LeaderboardSummary {
  totalApps: number;
  totalEvalSets: number;
  avgScore: number;
  topApp?: {
    id: string;
    name: string;
    score: number;
  };
}

export interface PaginatedLeaderboardResponse {
  items: LeaderboardItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
