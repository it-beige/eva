export interface TraceLog {
    id: string;
    traceId: string;
    sessionId: string | null;
    userId: string | null;
    nodeId: string | null;
    messageId: string | null;
    input: string | null;
    output: string | null;
    inputTokens: number | null;
    outputTokens: number | null;
    ttft: number | null;
    status: string | null;
    sourceProject: string | null;
    calledAt: string;
}
export interface TraceListResult {
    list: TraceLog[];
    total: number;
    page: number;
    pageSize: number;
}
export interface QueryTraceParams {
    startTime?: string;
    endTime?: string;
    idSearch?: string;
    status?: string;
    userId?: string;
    inputKeyword?: string;
    outputKeyword?: string;
    page?: number;
    pageSize?: number;
}
export interface CreateTraceDto {
    traceId: string;
    sessionId?: string;
    userId?: string;
    nodeId?: string;
    messageId?: string;
    input?: string;
    output?: string;
    inputTokens?: number;
    outputTokens?: number;
    ttft?: number;
    status?: string;
    sourceProject?: string;
    calledAt?: string;
}
export type TraceStatus = 'success' | 'error' | 'pending' | 'timeout';
export declare const TRACE_STATUS_OPTIONS: {
    label: string;
    value: string;
}[];
export declare const TIME_RANGE_OPTIONS: {
    label: string;
    value: string;
}[];
