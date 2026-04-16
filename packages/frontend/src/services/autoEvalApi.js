import api from './api';
export const autoEvalApi = {
    // 获取自动化评测列表
    getList: async (params = {}) => {
        const response = await api.get('/auto-evals', { params });
        return response.data;
    },
    // 获取单个自动化评测详情
    getById: async (id) => {
        const response = await api.get(`/auto-evals/${id}`);
        return response.data;
    },
    // 创建自动化评测
    create: async (data) => {
        const response = await api.post('/auto-evals', data);
        return response.data;
    },
    // 更新自动化评测
    update: async (id, data) => {
        const response = await api.put(`/auto-evals/${id}`, data);
        return response.data;
    },
    // 删除单个自动化评测
    delete: async (id) => {
        await api.delete(`/auto-evals/${id}`);
    },
    // 批量删除自动化评测
    deleteMany: async (ids) => {
        await api.delete('/auto-evals', { data: { ids } });
    },
    // 调试过滤采样规则
    debugFilter: async (data) => {
        const response = await api.post('/auto-evals/debug-filter', data);
        return response.data;
    },
    // 调试评测规则
    debugEval: async (data) => {
        const response = await api.post('/auto-evals/debug-eval', data);
        return response.data;
    },
};
export default autoEvalApi;
