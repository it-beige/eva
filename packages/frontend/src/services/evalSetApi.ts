import api from './api';
import {
  EvalSet,
  EvalSetItem,
  EvalSetType,
  PaginatedResponse,
} from '@eva/shared';

export interface CreateEvalSetData {
  name: string;
  type: EvalSetType;
  description?: string;
  sourceType: string;
  gitRepoUrl?: string;
  publicEvalSetId?: string;
  fileUrl?: string;
  odpsTableName?: string;
  odpsPartition?: string;
  exampleFileUrl?: string;
  aiModelId?: string;
  aiGenerateCount?: number;
  columns?: Array<{ name: string; type: string }>;
  sdkEndpoint?: string;
  sdkApiKey?: string;
}

export interface UpdateEvalSetData {
  name?: string;
  description?: string;
  gitRepoUrl?: string;
}

export interface QueryEvalSetParams {
  page?: number;
  pageSize?: number;
  type?: EvalSetType;
  keyword?: string;
}

export interface CreateEvalSetItemData {
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateEvalSetItemData {
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// 评测集 API
export const evalSetApi = {
  // 获取评测集列表
  getEvalSets: async (params: QueryEvalSetParams = {}) => {
    const response = await api.get<PaginatedResponse<EvalSet>>('/eval-sets', {
      params,
    });
    return response.data;
  },

  // 获取评测集详情
  getEvalSet: async (id: string) => {
    const response = await api.get<EvalSet>(`/eval-sets/${id}`);
    return response.data;
  },

  // 创建评测集
  createEvalSet: async (data: CreateEvalSetData) => {
    const response = await api.post<EvalSet>('/eval-sets', data);
    return response.data;
  },

  // 更新评测集
  updateEvalSet: async (id: string, data: UpdateEvalSetData) => {
    const response = await api.put<EvalSet>(`/eval-sets/${id}`, data);
    return response.data;
  },

  // 删除评测集
  deleteEvalSet: async (id: string) => {
    await api.delete(`/eval-sets/${id}`);
  },

  // 添加标签
  addTag: async (id: string, tagName: string) => {
    const response = await api.post<EvalSet>(`/eval-sets/${id}/tags`, {
      tagName,
    });
    return response.data;
  },

  // 删除标签
  removeTag: async (id: string, tagName: string) => {
    await api.delete(`/eval-sets/${id}/tags/${tagName}`);
  },
};

// 评测集数据项 API
export const evalSetItemApi = {
  // 获取数据项列表
  getItems: async (
    evalSetId: string,
    params: { page?: number; pageSize?: number } = {},
  ) => {
    const response = await api.get<PaginatedResponse<EvalSetItem>>(
      `/eval-sets/${evalSetId}/items`,
      { params },
    );
    return response.data;
  },

  // 创建数据项
  createItem: async (evalSetId: string, data: CreateEvalSetItemData) => {
    const response = await api.post<EvalSetItem>(
      `/eval-sets/${evalSetId}/items`,
      data,
    );
    return response.data;
  },

  // 更新数据项
  updateItem: async (
    evalSetId: string,
    itemId: string,
    data: UpdateEvalSetItemData,
  ) => {
    const response = await api.put<EvalSetItem>(
      `/eval-sets/${evalSetId}/items/${itemId}`,
      data,
    );
    return response.data;
  },

  // 删除数据项
  deleteItem: async (evalSetId: string, itemId: string) => {
    await api.delete(`/eval-sets/${evalSetId}/items/${itemId}`);
  },

  // 批量导入
  batchImport: async (evalSetId: string, fileUrl: string) => {
    const response = await api.post<{ imported: number }>(
      `/eval-sets/${evalSetId}/items/batch-import`,
      { fileUrl },
    );
    return response.data;
  },

  // 导出数据
  exportItems: async (evalSetId: string) => {
    const response = await api.get<{ fileUrl: string }>(
      `/eval-sets/${evalSetId}/items/export`,
    );
    return response.data;
  },
};

export default {
  ...evalSetApi,
  items: evalSetItemApi,
};
