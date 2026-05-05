// src/api/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth/useAuthStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle new backend format
api.interceptors.response.use(
    (response) => {
        const { success, data } = response.data;
        if (success) return { ...response, data };

        const error = new Error(response.data.message || 'Server error');
        (error as any).response = response;
        throw error;
    },

    async (error) => {
        const originalRequest = error.config;

        // PREVENT INFINITE LOOP: Do not retry if the refresh token request itself fails with 401
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            // IMPORTANT: Do not retry if the failing request is the refresh-token endpoint
            !originalRequest.url?.includes('/users/refresh-token') &&
            !originalRequest.url?.includes('/users/login')
        ) {
            originalRequest._retry = true;

            try {
                const { data } = await api.post('/users/refresh-token');

                // Backend returns: { success: true, data: { accessToken: "..." } }
                const newAccessToken = data?.accessToken || data?.data?.accessToken;

                if (!newAccessToken) {
                    throw new Error('No new access token received');
                }

                // Update token in store and request header
                useAuthStore.getState().setAccessToken(newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token expired or invalid → force logout
                useAuthStore.getState().clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Other errors (network, 500, or refresh token failure)
        if (error.response) {
            const msg = error.response.data?.message || error.message;
            const err = new Error(msg);
            (err as any).response = error.response;
            return Promise.reject(err);
        }

        return Promise.reject(error);
    }
);

export default api;