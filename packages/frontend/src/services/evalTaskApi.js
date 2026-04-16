import api from './api';
// 评测任务 API
export const evalTaskApi = {
    // 获取评测任务列表
    getEvalTasks: async (params = {}) => {
        const response = await api.get('/eval-tasks', {
            params,
        });
        return response.data;
    },
    // 获取评测任务详情
    getEvalTask: async (id) => {
        const response = await api.get(`/eval-tasks/${id}`);
        return response.data;
    },
    // 创建评测任务
    createEvalTask: async (data) => {
        const response = await api.post('/eval-tasks', data);
        return response.data;
    },
    // 复制评测任务
    copyEvalTask: async (id) => {
        const response = await api.post(`/eval-tasks/${id}/copy`);
        return response.data;
    },
    // 中止评测任务
    abortEvalTask: async (id) => {
        const response = await api.post(`/eval-tasks/${id}/abort`);
        return response.data;
    },
    // 获取任务日志
    getEvalTaskLogs: async (id) => {
        const response = await api.get(`/eval-tasks/${id}/logs`);
        return response.data;
    },
    // 批量操作
    batchOperation: async (data) => {
        const response = await api.post('/eval-tasks/batch', data);
        return response.data;
    },
};
export default evalTaskApi;
