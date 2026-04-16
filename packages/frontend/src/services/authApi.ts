import api from './api';
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
} from '@eva/shared';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  me: async (): Promise<AuthenticatedUser> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authApi;
