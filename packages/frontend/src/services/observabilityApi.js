import api from './api';
export const observabilityApi = {
    // 获取 Trace 列表
    getTraces: async (params) => {
        const response = await api.get('/traces', { params });
        return response.data;
    },
    // 获取单个 Trace 详情
    getTraceById: async (id) => {
        const response = await api.get(`/traces/${id}`);
        return response.data;
    },
    // 获取行为日志
    getBehaviorLogs: async (traceId) => {
        const response = await api.get(`/traces/${traceId}/logs`);
        return response.data;
    },
    // 创建 Trace 记录
    createTrace: async (data) => {
        const response = await api.post('/traces', data);
        return response.data;
    },
};
export default observabilityApi;
