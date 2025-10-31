export const validators = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    phone: (value) => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        const digitsCount = value.replace(/\D/g, '').length;
        return phoneRegex.test(value) && digitsCount >= 10;
    },
    password: (value) => {
        return value.length >= 8;
    },
    strongPassword: (value) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        return value.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    },
    url: (value) => {
        try {
            new URL(value);
            return true;
        }
        catch (_a) {
            return false;
        }
    },
    required: (value) => {
        if (typeof value === 'string')
            return value.trim().length > 0;
        return value != null && value !== '';
    },
    minLength: (value, min) => {
        return value.length >= min;
    },
    maxLength: (value, max) => {
        return value.length <= max;
    },
    number: (value) => {
        return !isNaN(Number(value));
    },
    positiveNumber: (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return !isNaN(num) && num > 0;
    },
};
