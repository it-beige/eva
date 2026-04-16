import type { TraceLog, TraceListResult, QueryTraceParams } from '../types/observability';
export declare const fetchTraces: import("@reduxjs/toolkit").AsyncThunk<TraceListResult, QueryTraceParams, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchTraceDetail: import("@reduxjs/toolkit").AsyncThunk<TraceLog, string, import("@reduxjs/toolkit").AsyncThunkConfig>;
export declare const fetchBehaviorLogs: import("@reduxjs/toolkit").AsyncThunk<TraceLog[], string, import("@reduxjs/toolkit").AsyncThunkConfig>;
interface FilterState {
    timeRange: string;
    startTime?: string;
    endTime?: string;
    idSearch: string;
    status: string;
    userId: string;
    inputKeyword: string;
    outputKeyword: string;
}
interface ObservabilityState {
    traces: TraceLog[];
    total: number;
    currentPage: number;
    pageSize: number;
    filters: FilterState;
    selectedTrace: TraceLog | null;
    behaviorLogs: TraceLog[];
    loading: boolean;
    detailLoading: boolean;
    logsLoading: boolean;
    error: string | null;
}
export declare const setFilters: import("@reduxjs/toolkit").ActionCreatorWithPayload<Partial<FilterState>, "observability/setFilters">, resetFilters: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"observability/resetFilters">, setPage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "observability/setPage">, setPageSize: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "observability/setPageSize">, clearSelectedTrace: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"observability/clearSelectedTrace">;
declare const _default: import("@reduxjs/toolkit").Reducer<ObservabilityState>;
export default _default;
