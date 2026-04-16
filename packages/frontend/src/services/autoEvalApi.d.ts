import { AutoEval, AutoEvalStatus, PaginatedResponse } from '@eva/shared';
export interface FilterCondition {
    field: string;
    operator: string;
    value: string;
}
export interface FilterRules {
    conditions: FilterCondition[];
}
export interface QueryAutoEvalParams {
    page?: number;
    pageSize?: number;
    status?: AutoEvalStatus;
    keyword?: string;
}
export interface CreateAutoEvalData {
    name: string;
    status?: AutoEvalStatus;
    filterRules?: FilterRules;
    sampleRate: number;
    metricIds?: string[];
}
export interface UpdateAutoEvalData extends Partial<CreateAutoEvalData> {
}
export interface DebugFilterData {
    startTime: string;
    endTime: string;
    filterRules?: FilterRules;
    sampleRate?: number;
}
export interface DebugEvalData extends DebugFilterData {
    traceId?: string;
}
export interface DebugFilterResult {
    traceId: string;
    duration: number;
    calledAt: string;
}
export interface DebugEvalResult {
    input: string;
    output: string;
    metrics: Array<{
        metricId: string;
        metricName: string;
        score: number;
    }>;
}
export declare const autoEvalApi: {
    getList: (params?: QueryAutoEvalParams) => Promise<PaginatedResponse<AutoEval>>;
    getById: (id: string) => Promise<AutoEval>;
    create: (data: CreateAutoEvalData) => Promise<AutoEval>;
    update: (id: string, data: UpdateAutoEvalData) => Promise<AutoEval>;
    delete: (id: string) => Promise<void>;
    deleteMany: (ids: string[]) => Promise<void>;
    debugFilter: (data: DebugFilterData) => Promise<DebugFilterResult[]>;
    debugEval: (data: DebugEvalData) => Promise<DebugEvalResult[]>;
};
export default autoEvalApi;
