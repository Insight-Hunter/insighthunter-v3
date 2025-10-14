// frontend/src/services/api.js
// Centralized API client with interceptors

import axios from ‘axios’;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ‘https://api.insighthunter.com’;

const api = axios.create({
baseURL: API_BASE_URL,
headers: {
‘Content-Type’: ‘application/json’
}
});

// Request interceptor to add auth token
api.interceptors.request.use(
(config) => {
const token = localStorage.getItem(‘accessToken’);
if (token) {
config.headers.Authorization = `Bearer ${token}`;
}
return config;
},
(error) => {
return Promise.reject(error);
}
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
(response) => response,
async (error) => {
const originalRequest = error.config;

```
// If error is 401 and we haven't tried to refresh yet
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;

  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    // Try to refresh the token
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    // Retry the original request with new token
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);

  } catch (refreshError) {
    // Refresh failed, logout user
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return Promise.reject(refreshError);
  }
}

return Promise.reject(error);
```

}
);

// API helper methods for different workers

export const authAPI = {
login: (email, password) => api.post(’/auth/login’, { email, password }),
signup: (name, email, password) => api.post(’/auth/signup’, { name, email, password }),
logout: () => api.post(’/auth/logout’),
verify: () => api.get(’/auth/verify’),
refresh: (refreshToken) => api.post(’/auth/refresh’, { refreshToken })
};

export const clientsAPI = {
getAll: () => api.get(’/management/clients’),
getById: (clientId) => api.get(`/management/clients/${clientId}`),
create: (clientData) => api.post(’/management/clients’, clientData),
update: (clientId, clientData) => api.put(`/management/clients/${clientId}`, clientData),
delete: (clientId) => api.delete(`/management/clients/${clientId}`)
};

export const uploadAPI = {
uploadCSV: (formData) => api.post(’/ingest/upload’, formData, {
headers: { ‘Content-Type’: ‘multipart/form-data’ }
}),
processCSV: (uploadId, clientId, columnMapping) =>
api.post(’/ingest/process’, { uploadId, clientId, columnMapping }),
getHistory: (limit = 20) => api.get(`/ingest/history?limit=${limit}`)
};

export const analyticsAPI = {
generateInsights: (clientId, dateRange) =>
api.post(’/analytics/insights’, { clientId, dateRange }),
generateForecast: (clientId, forecastType, months) =>
api.post(’/analytics/forecast’, { clientId, forecastType, months }),
generateReport: (clientId, reportType, dateRange) =>
api.post(’/analytics/report’, { clientId, reportType, dateRange }),
getDashboardData: (clientId) => api.get(`/analytics/dashboard?clientId=${clientId}`)
};

export const managementAPI = {
getProfile: () => api.get(’/management/profile’),
updateProfile: (updates) => api.put(’/management/profile’, updates),
getUsage: () => api.get(’/management/usage’),
getAlerts: (unreadOnly = false) =>
api.get(`/management/alerts${unreadOnly ? '?unread=true' : ''}`),
markAlertRead: (alertId) => api.put(`/management/alerts/${alertId}`)
};

export default api;
