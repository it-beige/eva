import { LeaderboardItem, LeaderboardSummary, QueryLeaderboardParams } from '../services/leaderboardApi';
interface LeaderboardState {
    items: LeaderboardItem[];
    summary: LeaderboardSummary | null;
    loading: boolean;
    summaryLoading: boolean;
    error: string | null;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: {
        evalSetId?: string;
        metricId?: string;
        sortBy: 'score' | 'rank';
        order: 'asc' | 'desc';
    };
}
export declare const fetchLeaderboard: import("@reduxjs/toolkit").AsyncThunk<import("../services/leaderboardApi").PaginatedLeaderboardResponse, QueryLeaderboardParams, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchLeaderboardSummary: import("@reduxjs/toolkit").AsyncThunk<LeaderboardSummary, void, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const setPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "leaderboard/setPage">, setPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "leaderboard/setPageSize">, setFilters: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<{
    evalSetId?: string;
    metricId?: string;
    sortBy: "score" | "rank";
    order: "asc" | "desc";
}>, "leaderboard/setFilters">, setEvalSetFilter: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<string | undefined, "leaderboard/setEvalSetFilter">, setMetricFilter: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<string | undefined, "leaderboard/setMetricFilter">, setSortBy: import("@reduxjs/toolkit").ActionCreatorWithPayload<"score" | "rank", "leaderboard/setSortBy">, setOrder: import("@reduxjs/toolkit").ActionCreatorWithPayload<"asc" | "desc", "leaderboard/setOrder">, clearError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"leaderboard/clearError">, resetFilters: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"leaderboard/resetFilters">;
declare const _default: import("@reduxjs/toolkit").Reducer<LeaderboardState>;
export default _default;
