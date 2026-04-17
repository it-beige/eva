import api from './api';
import type {
  CreateProjectRequest,
  UpdateProjectDetailRequest,
  ProjectSource,
} from '@eva/shared';

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  source?: ProjectSource;
  adminId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  list: ProjectItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProjectItem {
  projectId: string;
  pid: string;
  projectName: string;
  description: string | null;
  appCode: string | null;
  source: ProjectSource;
  admins: { id: string; name: string; employeeId: string }[];
  users: { id: string; name: string; employeeId: string }[];
  userCount: number;
  encryption: { keyName: string; issueCode: string; generated: boolean } | null;
  jointApps: string[] | null;
  createMode: string;
  createTime: string;
  updateTime: string;
}

export interface SearchUserItem {
  id: string;
  name: string;
  employeeId: string;
  displayName: string;
}

export interface PlatformItem {
  platformId: string;
  platformName: string;
  platformCode: string;
}

export interface AppItem {
  appId: string;
  appName: string;
  appCode: string;
  platform: string;
}

const projectApi = {
  getProjects: async (params: ProjectListParams): Promise<ProjectListResponse> => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  getProject: async (id: string): Promise<ProjectItem> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<{ projectId: string; pid: string }> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  updateProject: async (id: string, data: UpdateProjectDetailRequest): Promise<void> => {
    await api.put(`/projects/${id}`, data);
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  generatePid: async (): Promise<{ pid: string }> => {
    const response = await api.get('/projects/generate-pid');
    return response.data;
  },

  searchUsers: async (keyword: string, limit?: number): Promise<SearchUserItem[]> => {
    const response = await api.get('/projects/users/search', {
      params: { keyword, limit },
    });
    return response.data;
  },

  getPlatforms: async (): Promise<PlatformItem[]> => {
    const response = await api.get('/projects/platforms');
    return response.data;
  },

  getApps: async (platform?: string): Promise<AppItem[]> => {
    const response = await api.get('/projects/apps', {
      params: { platform },
    });
    return response.data;
  },
};

export default projectApi;
