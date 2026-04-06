import axios from 'axios';

// In dev, Vite proxies /api → localhost:5000/api.
// In production, use VITE_API_BASE_URL env var or fall back to relative /api.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
});

// Interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            return Promise.reject(new Error('Network error. Please check your connection and API URL.'));
        }
        return Promise.reject(error);
    }
);

export default api;
