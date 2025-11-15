import axios from 'axios';

const API_BASE_URL = 'https://ai-website-monitoring.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - token automatically add karega
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

// Response interceptor - auto logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const websitesAPI = {
  getAll: () => api.get('/websites'),
  getById: (id) => api.get(`/websites/${id}`),
  create: (data) => api.post('/websites', data),
  update: (id, data) => api.put(`/websites/${id}`, data),
  delete: (id) => api.delete(`/websites/${id}`),
};

export const monitorAPI = {
  manualCheck: (websiteId) => api.post(`/monitor/check/${websiteId}`),
  getHistory: (websiteId) => api.get(`/monitor/history/${websiteId}`),
  getStats: (websiteId) => api.get(`/monitor/stats/${websiteId}`),
};

export const telegramAPI = {
  connect: (chatId) => api.post('/telegram/connect', { chatId }),
  sendSummary: (websiteId) => api.post(`/telegram/summary/${websiteId}`),
  getConnectionStatus: () => api.get('/telegram/connection-status'),
  disconnect: () => api.post('/telegram/disconnect'),
};

export default api;