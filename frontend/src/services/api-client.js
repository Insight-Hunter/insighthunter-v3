// src/services/api-client.js
// API client that makes requests to your Workers

import { API_CONFIG } from '../config/api.js';

class InsightHunterAPI {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.authToken = localStorage.getItem('authToken');
  }
  
  // Helper to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Include auth token if we have one
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    return response;
  }
  
  // Authentication methods
  async login(email, password) {
    // Makes a request to https://api.insighthunter.app/auth/login
    const response = await this.request(API_CONFIG.endpoints.login, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      this.authToken = data.token;
      localStorage.setItem('authToken', data.token);
      return data.user;
    }
    
    throw new Error(data.error);
  }
  
  // CSV upload method
  async uploadCSV(file, clientId = null) {
    // Makes a request to https://api.insighthunter.app/api/upload
    const formData = new FormData();
    formData.append('file', file);
    if (clientId) {
      formData.append('client_id', clientId);
    }
    
    const response = await fetch(`${this.baseURL}${API_CONFIG.endpoints.uploadCSV}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      },
      body: formData
    });
    
    return response.json();
  }
  
  // Forecast retrieval
  async getForecast(clientId, timeRange = '90days') {
    // Makes a request to https://api.insighthunter.app/api/forecast
    const params = new URLSearchParams({ time_range: timeRange });
    if (clientId) {
      params.append('client_id', clientId);
    }
    
    const response = await this.request(
      `${API_CONFIG.endpoints.getForecast}?${params.toString()}`,
      { method: 'GET' }
    );
    
    return response.json();
  }
}

export default new InsightHunterAPI();
