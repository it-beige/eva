import api from './api';

export interface ProjectSettings {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
}

export interface Member {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
}

export interface AddMemberRequest {
  email: string;
  role: 'owner' | 'admin' | 'member';
}

export interface UpdateMemberRequest {
  role: 'owner' | 'admin' | 'member';
}

export interface ApiToken {
  id: string;
  name: string;
  maskedToken: string;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreateTokenRequest {
  name: string;
  expiresIn?: number; // 过期时间（天），不传表示永不过期
}

export interface CreateTokenResponse extends ApiToken {
  token: string; // 仅创建时返回完整 token
}

export const settingsApi = {
  // ========== 项目设置 ==========
  
  /**
   * 获取项目设置
   */
  getProjectSettings: async (): Promise<ProjectSettings> => {
    const response = await api.get('/settings/project');
    return response.data;
  },

  /**
   * 更新项目设置
   */
  updateProjectSettings: async (
    data: UpdateProjectRequest
  ): Promise<ProjectSettings> => {
    const response = await api.put('/settings/project', data);
    return response.data;
  },

  // ========== 成员管理 ==========

  /**
   * 获取成员列表
   */
  getMembers: async (): Promise<Member[]> => {
    const response = await api.get('/settings/members');
    return response.data;
  },

  /**
   * 添加成员
   */
  addMember: async (data: AddMemberRequest): Promise<Member> => {
    const response = await api.post('/settings/members', data);
    return response.data;
  },

  /**
   * 更新成员角色
   */
  updateMember: async (
    id: string,
    data: UpdateMemberRequest
  ): Promise<Member> => {
    const response = await api.put(`/settings/members/${id}`, data);
    return response.data;
  },

  /**
   * 移除成员
   */
  removeMember: async (id: string): Promise<void> => {
    await api.delete(`/settings/members/${id}`);
  },

  // ========== Token 管理 ==========

  /**
   * 获取 API Token 列表
   */
  getTokens: async (): Promise<ApiToken[]> => {
    const response = await api.get('/settings/tokens');
    return response.data;
  },

  /**
   * 创建 API Token
   */
  createToken: async (data: CreateTokenRequest): Promise<CreateTokenResponse> => {
    const response = await api.post('/settings/tokens', data);
    return response.data;
  },

  /**
   * 删除 API Token
   */
  deleteToken: async (id: string): Promise<void> => {
    await api.delete(`/settings/tokens/${id}`);
  },
};

export default settingsApi;
