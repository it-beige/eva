import api from './api';
export const promptApi = {
    // 获取 Prompt 列表
    getPrompts: (params = {}) => {
        return api.get('/prompts', { params });
    },
    // 获取 Prompt 详情
    getPrompt: (id) => {
        return api.get(`/prompts/${id}`);
    },
    // 创建 Prompt
    createPrompt: (data) => {
        return api.post('/prompts', data);
    },
    // 更新 Prompt
    updatePrompt: (id, data) => {
        return api.put(`/prompts/${id}`, data);
    },
    // 删除 Prompt
    deletePrompt: (id) => {
        return api.delete(`/prompts/${id}`);
    },
    // 获取版本列表
    getVersions: (promptId) => {
        return api.get(`/prompts/${promptId}/versions`);
    },
    // 获取版本详情
    getVersion: (promptId, versionId) => {
        return api.get(`/prompts/${promptId}/versions/${versionId}`);
    },
};
export default promptApi;
