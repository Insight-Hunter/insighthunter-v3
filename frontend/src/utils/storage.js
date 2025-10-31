export const storage = {
    get: (key, defaultValue) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
        }
        catch (_a) {
            return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        }
        catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    },
    has: (key) => {
        return localStorage.getItem(key) !== null;
    },
};
// Session storage (same API)
export const sessionStorage = {
    get: (key, defaultValue) => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
        }
        catch (_a) {
            return defaultValue !== null && defaultValue !== void 0 ? defaultValue : null;
        }
    },
    set: (key, value) => {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error('Failed to save to sessionStorage:', error);
        }
    },
    remove: (key) => {
        try {
            window.sessionStorage.removeItem(key);
        }
        catch (error) {
            console.error('Failed to remove from sessionStorage:', error);
        }
    },
    clear: () => {
        try {
            window.sessionStorage.clear();
        }
        catch (error) {
            console.error('Failed to clear sessionStorage:', error);
        }
    },
};
