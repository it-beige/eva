import { EvalMetric, MetricType, MetricScope, PaginatedResponse } from '@eva/shared';
export interface QueryEvalMetricParams {
    page?: number;
    pageSize?: number;
    scope?: MetricScope;
    type?: MetricType;
    keyword?: string;
}
export interface CreateEvalMetricData {
    name: string;
    description?: string;
    type: MetricType;
    scope?: MetricScope;
    prompt?: string;
    codeRepoUrl?: string;
    codeBranch?: string;
}
export interface UpdateEvalMetricData extends Partial<CreateEvalMetricData> {
}
export interface ParseRepoData {
    codeRepoUrl: string;
    codeBranch: string;
}
export interface ParseRepoResponse {
    metrics: string[];
    message: string;
}
export declare const evalMetricApi: {
    getList: (params?: QueryEvalMetricParams) => Promise<PaginatedResponse<EvalMetric>>;
    getById: (id: string) => Promise<EvalMetric>;
    create: (data: CreateEvalMetricData) => Promise<EvalMetric>;
    update: (id: string, data: UpdateEvalMetricData) => Promise<EvalMetric>;
    delete: (id: string) => Promise<void>;
    deleteMany: (ids: string[]) => Promise<void>;
    parseRepo: (data: ParseRepoData) => Promise<ParseRepoResponse>;
};
export default evalMetricApi;
