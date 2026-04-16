import api from './api';
// 评测集 API
export const evalSetApi = {
    // 获取评测集列表
    getEvalSets: async (params = {}) => {
        const response = await api.get('/eval-sets', {
            params,
        });
        return response.data;
    },
    // 获取评测集详情
    getEvalSet: async (id) => {
        const response = await api.get(`/eval-sets/${id}`);
        return response.data;
    },
    // 创建评测集
    createEvalSet: async (data) => {
        const response = await api.post('/eval-sets', data);
        return response.data;
    },
    // 更新评测集
    updateEvalSet: async (id, data) => {
        const response = await api.put(`/eval-sets/${id}`, data);
        return response.data;
    },
    // 删除评测集
    deleteEvalSet: async (id) => {
        await api.delete(`/eval-sets/${id}`);
    },
    // 添加标签
    addTag: async (id, tagName) => {
        const response = await api.post(`/eval-sets/${id}/tags`, {
            tagName,
        });
        return response.data;
    },
    // 删除标签
    removeTag: async (id, tagName) => {
        await api.delete(`/eval-sets/${id}/tags/${tagName}`);
    },
};
// 评测集数据项 API
export const evalSetItemApi = {
    // 获取数据项列表
    getItems: async (evalSetId, params = {}) => {
        const response = await api.get(`/eval-sets/${evalSetId}/items`, { params });
        return response.data;
    },
    // 创建数据项
    createItem: async (evalSetId, data) => {
        const response = await api.post(`/eval-sets/${evalSetId}/items`, data);
        return response.data;
    },
    // 更新数据项
    updateItem: async (evalSetId, itemId, data) => {
        const response = await api.put(`/eval-sets/${evalSetId}/items/${itemId}`, data);
        return response.data;
    },
    // 删除数据项
    deleteItem: async (evalSetId, itemId) => {
        await api.delete(`/eval-sets/${evalSetId}/items/${itemId}`);
    },
    // 批量导入
    batchImport: async (evalSetId, fileUrl) => {
        const response = await api.post(`/eval-sets/${evalSetId}/items/batch-import`, { fileUrl });
        return response.data;
    },
    // 导出数据
    exportItems: async (evalSetId) => {
        const response = await api.get(`/eval-sets/${evalSetId}/items/export`);
        return response.data;
    },
};
export default {
    ...evalSetApi,
    items: evalSetItemApi,
};
