import api from './api';

export interface AIApplication {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  latestVersion: string | null;
  gitRepoUrl: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  versions?: AppVersion[];
}

export interface AppVersion {
  id: string;
  appId: string;
  version: string;
  config: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  icon?: string;
  gitRepoUrl?: string;
  projectId: string;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  icon?: string;
  gitRepoUrl?: string;
  projectId?: string;
}

export interface ImportPublicAgentRequest {
  name: string;
  gitRepoUrl: string;
  projectId: string;
}

export interface CreateVersionRequest {
  version: string;
  config?: Record<string, unknown>;
}

export interface QueryApplicationsParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  projectId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const aiApplicationApi = {
  // 获取应用列表
  getApplications: async (
    params: QueryApplicationsParams = {}
  ): Promise<PaginatedResponse<AIApplication>> => {
    const response = await api.get('/ai-applications', { params });
    return response.data;
  },

  // 获取应用详情
  getApplication: async (id: string): Promise<AIApplication> => {
    const response = await api.get(`/ai-applications/${id}`);
    return response.data;
  },

  // 创建应用
  createApplication: async (
    data: CreateApplicationRequest
  ): Promise<AIApplication> => {
    const response = await api.post('/ai-applications', data);
    return response.data;
  },

  // 更新应用
  updateApplication: async (
    id: string,
    data: UpdateApplicationRequest
  ): Promise<AIApplication> => {
    const response = await api.put(`/ai-applications/${id}`, data);
    return response.data;
  },

  // 删除应用
  deleteApplication: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/ai-applications/${id}`);
    return response.data;
  },

  // 获取版本列表
  getVersions: async (appId: string): Promise<AppVersion[]> => {
    const response = await api.get(`/ai-applications/${appId}/versions`);
    return response.data;
  },

  // 创建版本
  createVersion: async (
    appId: string,
    data: CreateVersionRequest
  ): Promise<AppVersion> => {
    const response = await api.post(`/ai-applications/${appId}/versions`, data);
    return response.data;
  },

  // 引用公共Code Agent
  importPublicAgent: async (
    data: ImportPublicAgentRequest
  ): Promise<AIApplication> => {
    const response = await api.post('/ai-applications/import-public', data);
    return response.data;
  },
};

export default aiApplicationApi;
