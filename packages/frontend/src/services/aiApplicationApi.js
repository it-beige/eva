import api from './api';
export const aiApplicationApi = {
    // 获取应用列表
    getApplications: async (params = {}) => {
        const response = await api.get('/ai-applications', { params });
        return response.data;
    },
    // 获取应用详情
    getApplication: async (id) => {
        const response = await api.get(`/ai-applications/${id}`);
        return response.data;
    },
    // 创建应用
    createApplication: async (data) => {
        const response = await api.post('/ai-applications', data);
        return response.data;
    },
    // 更新应用
    updateApplication: async (id, data) => {
        const response = await api.put(`/ai-applications/${id}`, data);
        return response.data;
    },
    // 删除应用
    deleteApplication: async (id) => {
        const response = await api.delete(`/ai-applications/${id}`);
        return response.data;
    },
    // 获取版本列表
    getVersions: async (appId) => {
        const response = await api.get(`/ai-applications/${appId}/versions`);
        return response.data;
    },
    // 创建版本
    createVersion: async (appId, data) => {
        const response = await api.post(`/ai-applications/${appId}/versions`, data);
        return response.data;
    },
    // 引用公共Code Agent
    importPublicAgent: async (data) => {
        const response = await api.post('/ai-applications/import-public', data);
        return response.data;
    },
};
export default aiApplicationApi;
