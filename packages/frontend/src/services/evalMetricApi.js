import api from './api';
export const evalMetricApi = {
    // 获取评估指标列表
    getList: async (params = {}) => {
        const response = await api.get('/eval-metrics', { params });
        return response.data;
    },
    // 获取单个评估指标详情
    getById: async (id) => {
        const response = await api.get(`/eval-metrics/${id}`);
        return response.data;
    },
    // 创建评估指标
    create: async (data) => {
        const response = await api.post('/eval-metrics', data);
        return response.data;
    },
    // 更新评估指标
    update: async (id, data) => {
        const response = await api.put(`/eval-metrics/${id}`, data);
        return response.data;
    },
    // 删除单个评估指标
    delete: async (id) => {
        await api.delete(`/eval-metrics/${id}`);
    },
    // 批量删除评估指标
    deleteMany: async (ids) => {
        await api.delete('/eval-metrics', { data: { ids } });
    },
    // 解析仓库指标
    parseRepo: async (data) => {
        const response = await api.post('/eval-metrics/parse-repo', data);
        return response.data;
    },
};
export default evalMetricApi;
