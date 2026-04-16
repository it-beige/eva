import api from './api';
import {
  AutoEval,
  AutoEvalStatus,
  PaginatedResponse,
} from '@eva/shared';

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

export interface UpdateAutoEvalData extends Partial<CreateAutoEvalData> {}

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

export const autoEvalApi = {
  // 获取自动化评测列表
  getList: async (
    params: QueryAutoEvalParams = {},
  ): Promise<PaginatedResponse<AutoEval>> => {
    const response = await api.get('/auto-evals', { params });
    return response.data;
  },

  // 获取单个自动化评测详情
  getById: async (id: string): Promise<AutoEval> => {
    const response = await api.get(`/auto-evals/${id}`);
    return response.data;
  },

  // 创建自动化评测
  create: async (data: CreateAutoEvalData): Promise<AutoEval> => {
    const response = await api.post('/auto-evals', data);
    return response.data;
  },

  // 更新自动化评测
  update: async (id: string, data: UpdateAutoEvalData): Promise<AutoEval> => {
    const response = await api.put(`/auto-evals/${id}`, data);
    return response.data;
  },

  // 删除单个自动化评测
  delete: async (id: string): Promise<void> => {
    await api.delete(`/auto-evals/${id}`);
  },

  // 批量删除自动化评测
  deleteMany: async (ids: string[]): Promise<void> => {
    await api.delete('/auto-evals', { data: { ids } });
  },

  // 调试过滤采样规则
  debugFilter: async (data: DebugFilterData): Promise<DebugFilterResult[]> => {
    const response = await api.post('/auto-evals/debug-filter', data);
    return response.data;
  },

  // 调试评测规则
  debugEval: async (data: DebugEvalData): Promise<DebugEvalResult[]> => {
    const response = await api.post('/auto-evals/debug-eval', data);
    return response.data;
  },
};

export default autoEvalApi;
