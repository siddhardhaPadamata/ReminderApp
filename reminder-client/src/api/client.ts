import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

// Extend config interface to track retry state
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

export const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
    (config: any) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// 2. Response Interceptor: Auto-refresh or auto-logout on 401 Unauthorized
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (
                originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/register')
            ) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            const userId = localStorage.getItem('userId');

            if (refreshToken && userId) {
                try {
                    const res = await axios.post('/api/auth/refresh', {
                        userId,
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = res.data;

                    localStorage.setItem('accessToken', accessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }

                    return apiClient(originalRequest);
                } catch (refreshErr) {
                    console.error('Session expired. Logging out...', refreshErr);
                    localStorage.clear();
                    window.location.href = '/';
                    return Promise.reject(refreshErr);
                }
            } else {
                localStorage.clear();
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;