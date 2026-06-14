import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 300000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Standard response wrapper to match Django API
const handleResponse = async (promise) => {
    try {
        const response = await promise;
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with an error
            throw error.response.data.error || {
                code: 'API_ERROR',
                message: error.response.data.message || 'An unexpected error occurred',
                details: error.response.data.details
            };
        } else if (error.request) {
            // Request was made but no response received
            throw {
                code: 'NETWORK_ERROR',
                message: 'No response from server. Please check your connection.',
            };
        } else {
            // Something else happened
            throw {
                code: 'CLIENT_ERROR',
                message: error.message,
            };
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
