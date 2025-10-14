// frontend/src/contexts/AuthContext.jsx
// Authentication context for managing user state

import React, { createContext, useContext, useState, useEffect } from ‘react’;
import api from ‘../services/api’;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
// Check for existing token on mount
const token = localStorage.getItem(‘accessToken’);
if (token) {
verifyToken(token);
} else {
setLoading(false);
}
}, []);

const verifyToken = async (token) => {
try {
const response = await api.get(’/auth/verify’, {
headers: { Authorization: `Bearer ${token}` }
});


  if (response.data.valid) {
    setUser(response.data.user);
    setIsAuthenticated(true);
  } else {
    logout();
  }
} catch (error) {
  console.error('Token verification failed:', error);
  logout();
} finally {
  setLoading(false);
}


};

const login = async (email, password) => {
try {
const response = await api.post(’/auth/login’, { email, password });
const { accessToken, refreshToken, user } = response.data;


  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  setUser(user);
  setIsAuthenticated(true);

  return { success: true };
} catch (error) {
  console.error('Login failed:', error);
  return {
    success: false,
    error: error.response?.data?.error || 'Login failed'
  };
}


};

const signup = async (name, email, password) => {
try {
const response = await api.post(’/auth/signup’, { name, email, password });
const { accessToken, refreshToken, user } = response.data;


  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  setUser(user);
  setIsAuthenticated(true);

  return { success: true };
} catch (error) {
  console.error('Signup failed:', error);
  return {
    success: false,
    error: error.response?.data?.error || 'Signup failed'
  };
}


};

const logout = () => {
localStorage.removeItem(‘accessToken’);
localStorage.removeItem(‘refreshToken’);
setUser(null);
setIsAuthenticated(false);
};

const refreshAccessToken = async () => {
try {
const refreshToken = localStorage.getItem(‘refreshToken’);
if (!refreshToken) {
throw new Error(‘No refresh token’);
}


  const response = await api.post('/auth/refresh', { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data;

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', newRefreshToken);

  return accessToken;
} catch (error) {
  console.error('Token refresh failed:', error);
  logout();
  throw error;
}

};

const value = {
user,
isAuthenticated,
loading,
login,
signup,
logout,
refreshAccessToken
};

return (
<AuthContext.Provider value={value}>
{children}
</AuthContext.Provider>
);
}

export function useAuth() {
const context = useContext(AuthContext);
if (!context) {
throw new Error(‘useAuth must be used within an AuthProvider’);
}
return context;
}
