import type { TraceLog, TraceListResult, QueryTraceParams, CreateTraceDto } from '../types/observability';
export declare const observabilityApi: {
    getTraces: (params: QueryTraceParams) => Promise<TraceListResult>;
    getTraceById: (id: string) => Promise<TraceLog>;
    getBehaviorLogs: (traceId: string) => Promise<TraceLog[]>;
    createTrace: (data: CreateTraceDto) => Promise<TraceLog>;
};
export default observabilityApi;
