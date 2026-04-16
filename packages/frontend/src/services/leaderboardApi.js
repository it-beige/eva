import api from './api';
export const leaderboardApi = {
    /**
     * 获取排行榜数据
     */
    getLeaderboard: async (params = {}) => {
        const response = await api.get('/leaderboard', { params });
        return response.data;
    },
    /**
     * 获取排行榜汇总统计
     */
    getSummary: async () => {
        const response = await api.get('/leaderboard/summary');
        return response.data;
    },
};
export default leaderboardApi;
