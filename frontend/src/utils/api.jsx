// src/config/api.js
// API configuration for your React frontend

// Determine the API base URL based on environment
// In development, you might want to point to localhost Workers
// In production, you point to your actual API subdomain
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.insighthunter.app'
  : 'http://localhost:8787';  // Local Wrangler dev server

// Export configuration that your API client will use
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Authentication endpoints
    register: '/auth/register',
    login: '/auth/login',
    verify: '/auth/verify',
    resetPassword: '/auth/reset-password',
    
    // Upload and transaction endpoints
    uploadCSV: '/api/upload',
    getTransactions: '/api/transactions',
    
    // Analytics endpoints
    getForecast: '/api/forecast',
    getInsights: '/api/insights',
    getDashboard: '/api/dashboard',
    
    // Management endpoints
    getClients: '/api/clients',
    createClient: '/api/clients',
    getAlerts: '/api/alerts',
    getUserProfile: '/api/user/profile'
  }
};
