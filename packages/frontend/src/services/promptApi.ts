import api from './api';

export interface Prompt {
  id: string;
  name: string;
  content: string;
  metadata: Record<string, unknown> | null;
  description: string | null;
  version: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: PromptVersion[];
}

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  content: string;
  createdAt: string;
}

export interface CreatePromptRequest {
  name: string;
  content: string;
  metadata?: Record<string, unknown>;
  description?: string;
}

export interface UpdatePromptRequest {
  content: string;
  metadata?: Record<string, unknown>;
  description?: string;
}

export interface QueryPromptParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const promptApi = {
  // 获取 Prompt 列表
  getPrompts: (params: QueryPromptParams = {}) => {
    return api.get<PaginatedResponse<Prompt>>('/prompts', { params });
  },

  // 获取 Prompt 详情
  getPrompt: (id: string) => {
    return api.get<Prompt>(`/prompts/${id}`);
  },

  // 创建 Prompt
  createPrompt: (data: CreatePromptRequest) => {
    return api.post<Prompt>('/prompts', data);
  },

  // 更新 Prompt
  updatePrompt: (id: string, data: UpdatePromptRequest) => {
    return api.put<Prompt>(`/prompts/${id}`, data);
  },

  // 删除 Prompt
  deletePrompt: (id: string) => {
    return api.delete(`/prompts/${id}`);
  },

  // 获取版本列表
  getVersions: (promptId: string) => {
    return api.get<PromptVersion[]>(`/prompts/${promptId}/versions`);
  },

  // 获取版本详情
  getVersion: (promptId: string, versionId: string) => {
    return api.get<PromptVersion>(`/prompts/${promptId}/versions/${versionId}`);
  },
};

export default promptApi;
