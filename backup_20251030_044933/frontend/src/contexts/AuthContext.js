var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
const AuthContext = createContext(null);
// You may fetch this status from your backend on login
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const verifyToken = useCallback((token) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield api.get('/auth/verify', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.valid) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
            else {
                logout();
            }
        }
        catch (error) {
            console.error('Token verification failed:', error);
            logout();
        }
        finally {
            setLoading(false);
        }
    }), []);
    useEffect(() => {
        let isMounted = true;
        const initAuth = () => __awaiter(this, void 0, void 0, function* () {
            const token = localStorage.getItem('accessToken');
            if (token) {
                if (isMounted) {
                    yield verifyToken(token);
                }
            }
            else {
                if (isMounted) {
                    setLoading(false);
                }
            }
        });
        initAuth();
        return () => {
            isMounted = false;
        };
    }, [verifyToken]);
    const login = (email, password) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield api.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            setIsAuthenticated(true);
            return { success: true };
        }
        catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: ((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Login failed',
            };
        }
    });
    const signup = (name, email, password) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield api.post('/auth/signup', { name, email, password });
            const { accessToken, refreshToken, user } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            setIsAuthenticated(true);
            return { success: true };
        }
        catch (error) {
            console.error('Signup failed:', error);
            return {
                success: false,
                error: ((_b = (_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Signup failed',
            };
        }
    });
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
    };
    const refreshAccessToken = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }
            const response = yield api.post('/auth/refresh', { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            return accessToken;
        }
        catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            throw error;
        }
    });
    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        refreshAccessToken,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
