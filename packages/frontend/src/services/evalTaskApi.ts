import api from './api';
import type {
  CreateEvalTaskRequest,
  EvalTaskResponse as EvalTaskWithEvalSet,
  EvalTaskStatus,
  PaginatedResponse,
} from '@eva/shared';

export type { CreateEvalTaskRequest, EvalTaskWithEvalSet };

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

// 评测任务 API
export const evalTaskApi = {
  // 获取评测任务列表
  getEvalTasks: async (params: QueryEvalTasksParams = {}) => {
    const response = await api.get<PaginatedResponse<EvalTaskWithEvalSet>>('/eval-tasks', {
      params,
    });
    return response.data;
  },

  // 获取评测任务详情
  getEvalTask: async (id: string) => {
    const response = await api.get<EvalTaskWithEvalSet>(`/eval-tasks/${id}`);
    return response.data;
  },

  // 创建评测任务
  createEvalTask: async (data: CreateEvalTaskRequest) => {
    const response = await api.post<EvalTaskWithEvalSet>('/eval-tasks', data);
    return response.data;
  },

  // 复制评测任务
  copyEvalTask: async (id: string) => {
    const response = await api.post<EvalTaskWithEvalSet>(`/eval-tasks/${id}/copy`);
    return response.data;
  },

  // 中止评测任务
  abortEvalTask: async (id: string) => {
    const response = await api.post<EvalTaskWithEvalSet>(`/eval-tasks/${id}/abort`);
    return response.data;
  },

  // 获取任务日志
  getEvalTaskLogs: async (id: string) => {
    const response = await api.get<string[]>(`/eval-tasks/${id}/logs`);
    return response.data;
  },

  // 批量操作
  batchOperation: async (data: BatchOperationRequest) => {
    const response = await api.post<BatchOperationResponse>('/eval-tasks/batch', data);
    return response.data;
  },
};

export default evalTaskApi;
