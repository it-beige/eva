import api from './api';
import {
  EvalMetric,
  MetricType,
  MetricScope,
  PaginatedResponse,
} from '@eva/shared';

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

export interface UpdateEvalMetricData extends Partial<CreateEvalMetricData> {}

export interface ParseRepoData {
  codeRepoUrl: string;
  codeBranch: string;
}

export interface ParseRepoResponse {
  metrics: string[];
  message: string;
}

export const evalMetricApi = {
  // 获取评估指标列表
  getList: async (
    params: QueryEvalMetricParams = {},
  ): Promise<PaginatedResponse<EvalMetric>> => {
    const response = await api.get('/eval-metrics', { params });
    return response.data;
  },

  // 获取单个评估指标详情
  getById: async (id: string): Promise<EvalMetric> => {
    const response = await api.get(`/eval-metrics/${id}`);
    return response.data;
  },

  // 创建评估指标
  create: async (data: CreateEvalMetricData): Promise<EvalMetric> => {
    const response = await api.post('/eval-metrics', data);
    return response.data;
  },

  // 更新评估指标
  update: async (id: string, data: UpdateEvalMetricData): Promise<EvalMetric> => {
    const response = await api.put(`/eval-metrics/${id}`, data);
    return response.data;
  },

  // 删除单个评估指标
  delete: async (id: string): Promise<void> => {
    await api.delete(`/eval-metrics/${id}`);
  },

  // 批量删除评估指标
  deleteMany: async (ids: string[]): Promise<void> => {
    await api.delete('/eval-metrics', { data: { ids } });
  },

  // 解析仓库指标
  parseRepo: async (data: ParseRepoData): Promise<ParseRepoResponse> => {
    const response = await api.post('/eval-metrics/parse-repo', data);
    return response.data;
  },
};

export default evalMetricApi;
