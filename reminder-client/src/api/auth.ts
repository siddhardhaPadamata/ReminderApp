import { apiClient } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const res = await apiClient.post<AuthResponse>('/auth/login', payload);
        const data = res.data as any;
        const jwt = data?.token || data?.accessToken || data?.Token;
        if (jwt) {
            localStorage.setItem('token', jwt);
        }
        return res.data;
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const res = await apiClient.post<AuthResponse>('/auth/register', payload);
        const data = res.data as any;
        const jwt = data?.token || data?.accessToken || data?.Token;
        if (jwt) {
            localStorage.setItem('token', jwt);
        }
        return res.data;
    },

    logout: async (userId: string): Promise<void> => {
        await apiClient.post(`/auth/logout/${userId}`);
        localStorage.clear();
    },

};