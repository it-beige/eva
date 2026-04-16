import axios from 'axios';
const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response) {
        const { status } = error.response;
        switch (status) {
            case 401:
                localStorage.removeItem('token');
                window.location.href = '/login';
                break;
            case 403:
                console.error('权限不足');
                break;
            case 500:
                console.error('服务器错误');
                break;
            default:
                console.error('请求失败:', error.message);
        }
    }
    return Promise.reject(error);
});
export default api;
