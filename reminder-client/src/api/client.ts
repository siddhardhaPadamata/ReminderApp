import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5154/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// In reminder-client/src/api/client.ts
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            const userId = localStorage.getItem('userId');

            if (refreshToken && userId) {
                try {
                    const res = await axios.post(
                        `${client.defaults.baseURL}/auth/refresh`,
                        { userId, refreshToken }
                    );
                    const newToken = res.data.accessToken;
                    localStorage.setItem('token', newToken);
                    localStorage.setItem('refreshToken', res.data.refreshToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return client(originalRequest);
                } catch {
                    localStorage.clear();
                    window.location.reload();
                }
            } else {
                localStorage.clear();
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);

// Export both names to satisfy all imports across the app
export const apiClient = client;
export { client };
export default client;