var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.insighthunter.app';
export class APIError extends Error {
    constructor(status, statusText, message) {
        super(message || statusText);
        this.status = status;
        this.statusText = statusText;
        this.name = 'APIError';
    }
}
export function apiRequest(endpoint_1) {
    return __awaiter(this, arguments, void 0, function* (endpoint, options = {}) {
        const { requiresAuth = true, headers: customHeaders } = options, fetchOptions = __rest(options, ["requiresAuth", "headers"]);
        const headers = Object.assign({ 'Content-Type': 'application/json' }, customHeaders);
        if (requiresAuth) {
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        try {
            const response = yield fetch(`${API_BASE}${endpoint}`, Object.assign(Object.assign({}, fetchOptions), { headers }));
            if (!response.ok) {
                let error = {};
                try {
                    error = yield response.json();
                }
                catch (_a) { }
                throw new APIError(response.status, response.statusText, error.message || error.error || response.statusText);
            }
            return response.json();
        }
        catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError(0, 'Network Error', (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error');
        }
    });
}
export const api = {
    get: (endpoint, options) => apiRequest(endpoint, Object.assign(Object.assign({}, options), { method: 'GET' })),
    post: (endpoint, any, options) => apiRequest(endpoint, Object.assign(Object.assign({}, options), { method: 'POST', body: JSON.stringify(data) })),
    put: (endpoint, any, options) => apiRequest(endpoint, Object.assign(Object.assign({}, options), { method: 'PUT', body: JSON.stringify(data) })),
    patch: (endpoint, any, options) => apiRequest(endpoint, Object.assign(Object.assign({}, options), { method: 'PATCH', body: JSON.stringify(data) })),
    delete: (endpoint, options) => apiRequest(endpoint, Object.assign(Object.assign({}, options), { method: 'DELETE' })),
};
// Upload file helper
export function uploadFile(endpoint, file, additionalData) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append('file', file);
        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }
        const token = localStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = yield fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) {
            let error = {};
            try {
                error = yield response.json();
            }
            catch (_a) { }
            throw new APIError(response.status, response.statusText, error.message || response.statusText);
        }
        return response.json();
    });
}
