import { EvalTask, EvalTaskStatus, EvalType, PaginatedResponse } from '@eva/shared';
export interface EvalSetInfo {
    id: string;
    name: string;
    type: string;
}
export interface EvalTaskWithEvalSet extends EvalTask {
    evalSet?: EvalSetInfo | null;
}
export interface CreateEvalTaskRequest {
    name: string;
    evalType: EvalType;
    evalMode?: string;
    maxConcurrency?: number;
    evalSetId?: string;
    evalItemId?: string;
    appId?: string;
    appVersion?: string;
    config?: Record<string, unknown>;
    audioConfig?: {
        datasetId: string;
        configFileId: string;
        configInfo: string;
    };
}
export interface QueryEvalTasksParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    evalSetId?: string;
    status?: EvalTaskStatus;
    evalType?: string;
}
export interface BatchOperationRequest {
    ids: string[];
    operation: 'abort' | 'delete';
}
export interface BatchOperationResponse {
    success: number;
    failed: number;
}
export declare const evalTaskApi: {
    getEvalTasks: (params?: QueryEvalTasksParams) => Promise<PaginatedResponse<EvalTaskWithEvalSet>>;
    getEvalTask: (id: string) => Promise<EvalTaskWithEvalSet>;
    createEvalTask: (data: CreateEvalTaskRequest) => Promise<EvalTask>;
    copyEvalTask: (id: string) => Promise<EvalTask>;
    abortEvalTask: (id: string) => Promise<EvalTask>;
    getEvalTaskLogs: (id: string) => Promise<string[]>;
    batchOperation: (data: BatchOperationRequest) => Promise<BatchOperationResponse>;
};
export default evalTaskApi;
