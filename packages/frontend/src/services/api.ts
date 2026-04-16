import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearSession, getAccessToken } from '../auth/session';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        ...response,
        data: (response.data as { data: unknown }).data,
      };
    }

    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          clearSession();
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
          break;
        case 403:
          console.error('权限不足');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error(
            '请求失败:',
            (
              error.response.data as { message?: string } | undefined
            )?.message || error.message,
          );
      }
    } else if (error.request) {
      // 网络错误处理（请求已发送但没有收到响应）
      if (error.code === 'ECONNABORTED') {
        console.error('请求超时，请检查网络连接');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('网络错误，请检查网络连接');
      } else {
        console.error('网络错误:', error.message);
      }
    } else {
      // 请求配置错误
      console.error('请求配置错误:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
