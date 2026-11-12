import { apiClient } from '../api/client';

export interface LoginRequest {
    identifier: string;
    password?: string;
    passwordHash?: string;
}

export interface RegisterRequest {
    email: string;
    phoneNumber?: string;
    password?: string;
    passwordHash?: string;
}

const saveToken = (data: any) => {
    const jwt = data?.token || data?.accessToken || data?.Token;
    if (jwt) {
        localStorage.setItem('token', jwt);
    }
};

export const login = async (data: LoginRequest) => {
    const response = await apiClient.post('/auth/login', data);
    saveToken(response.data);
    return response.data;
};

export const register = async (data: RegisterRequest) => {
    const response = await apiClient.post('/auth/register', data);
    saveToken(response.data);
    return response.data;
};

export const authApi = {
    login,
    register,
};

export default authApi;