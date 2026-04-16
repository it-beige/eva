import api from './api';
export const settingsApi = {
    // ========== 项目设置 ==========
    /**
     * 获取项目设置
     */
    getProjectSettings: async () => {
        const response = await api.get('/settings/project');
        return response.data;
    },
    /**
     * 更新项目设置
     */
    updateProjectSettings: async (data) => {
        const response = await api.put('/settings/project', data);
        return response.data;
    },
    // ========== 成员管理 ==========
    /**
     * 获取成员列表
     */
    getMembers: async () => {
        const response = await api.get('/settings/members');
        return response.data;
    },
    /**
     * 添加成员
     */
    addMember: async (data) => {
        const response = await api.post('/settings/members', data);
        return response.data;
    },
    /**
     * 更新成员角色
     */
    updateMember: async (id, data) => {
        const response = await api.put(`/settings/members/${id}`, data);
        return response.data;
    },
    /**
     * 移除成员
     */
    removeMember: async (id) => {
        await api.delete(`/settings/members/${id}`);
    },
    // ========== Token 管理 ==========
    /**
     * 获取 API Token 列表
     */
    getTokens: async () => {
        const response = await api.get('/settings/tokens');
        return response.data;
    },
    /**
     * 创建 API Token
     */
    createToken: async (data) => {
        const response = await api.post('/settings/tokens', data);
        return response.data;
    },
    /**
     * 删除 API Token
     */
    deleteToken: async (id) => {
        await api.delete(`/settings/tokens/${id}`);
    },
};
export default settingsApi;
