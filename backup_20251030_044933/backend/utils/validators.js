export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function validateRequired(value, fieldName) {
    if (value === undefined || value === null || value === '') {
        return `${fieldName} is required`;
    }
    return null;
}
export function validateLength(value, min, max, fieldName) {
    if (value.length < min) {
        return `${fieldName} must be at least ${min} characters`;
    }
    if (value.length > max) {
        return `${fieldName} must be no more than ${max} characters`;
    }
    return null;
}
export function validateNumber(value, fieldName) {
    if (isNaN(Number(value))) {
        return `${fieldName} must be a number`;
    }
    return null;
}
