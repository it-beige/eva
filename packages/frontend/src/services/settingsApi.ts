import api from './api';
import type {
  AddMemberRequest,
  ApiTokenResponse as ApiToken,
  CreateTokenRequest,
  CreateTokenResponse,
  ProjectSettingsResponse as ProjectSettings,
  UpdateMemberRequest,
  UpdateProjectRequest,
  WorkspaceMember as Member,
} from '@eva/shared';

export type {
  AddMemberRequest,
  ApiToken,
  CreateTokenRequest,
  CreateTokenResponse,
  Member,
  ProjectSettings,
  UpdateMemberRequest,
  UpdateProjectRequest,
};

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
