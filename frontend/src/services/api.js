import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://127.0.0.1:8000`;

console.log('[API] Base URL:', API_BASE_URL);

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 300000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — log every outgoing request
apiClient.interceptors.request.use(
    (config) => {
        console.log(`[API] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
        return config;
    },
    (error) => {
        console.error('[API] Request setup error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor — log every incoming response
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API] ← ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error(`[API] ← ${error.response.status} ${error.config?.url}`, error.response.data);
        } else if (error.request) {
            console.error(`[API] ✕ No response for ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, {
                message: error.message,
                code: error.code,
            });
        } else {
            console.error('[API] ✕ Request error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Standard response wrapper to match Django API
const handleResponse = async (promise) => {
    try {
        const response = await promise;
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with an error
            const serverError = error.response.data?.error || {
                code: 'API_ERROR',
                message: error.response.data?.message || `Server error ${error.response.status}`,
                details: error.response.data?.details
            };
            console.error('[API] Server error:', serverError);
            throw serverError;
        } else if (error.request) {
            // Request was made but no response received
            const networkError = {
                code: 'NETWORK_ERROR',
                message: `No response from server (${error.code || 'unknown'}). Backend may not be running at ${API_BASE_URL}`,
            };
            console.error('[API] Network error:', networkError, '\nOriginal:', error.message);
            throw networkError;
        } else {
            // Something else happened
            const clientError = {
                code: 'CLIENT_ERROR',
                message: error.message,
            };
            console.error('[API] Client error:', clientError);
            throw clientError;
        }
    }
};

export const researchService = {
    create: (topic) => handleResponse(apiClient.post('/research/', { topic })),
    get: (taskId) => handleResponse(apiClient.get(`/research/${taskId}/`)),
    cancel: (taskId) => handleResponse(apiClient.post(`/research/${taskId}/cancel/`)),
    getHistory: (params = {}) => handleResponse(apiClient.get('/research/history/', { params })),
    delete: (taskId) => handleResponse(apiClient.delete(`/research/${taskId}/delete/`)),
    health: () => handleResponse(apiClient.get('/health/')),
};

export default apiClient;
