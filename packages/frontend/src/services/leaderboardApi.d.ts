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
export interface QueryLeaderboardParams {
    evalSetId?: string;
    metricId?: string;
    sortBy?: 'score' | 'rank';
    order?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}
export interface PaginatedLeaderboardResponse {
    items: LeaderboardItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare const leaderboardApi: {
    /**
     * 获取排行榜数据
     */
    getLeaderboard: (params?: QueryLeaderboardParams) => Promise<PaginatedLeaderboardResponse>;
    /**
     * 获取排行榜汇总统计
     */
    getSummary: () => Promise<LeaderboardSummary>;
};
export default leaderboardApi;
