// workers/auth/validation.js
// Input validation functions for authentication

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (trimmedEmail.length > 255) {
    return { valid: false, error: 'Email is too long' };
  }

  // RFC 5322 compliant email regex (simplified and fixed with escaped dot)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (typeof password !== 'string') {
    return { valid: false, error: 'Password must be a string' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }

  // Check for at least one letter and one number (basic strength requirement)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: 'Password must contain at least one letter and one number'
    };
  }

  return { valid: true };
}

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateName(name) {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }

  if (typeof name !== 'string') {
    return { valid: false, error: 'Name must be a string' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { valid: false, error: 'Name is too long (max 100 characters)' };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s-']+$/;

  if (!nameRegex.test(trimmedName)) {
    return {
      valid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }

  return { valid: true };
}

/**
 * Calculate password strength
 * @param {string} password - Password to evaluate
 * @returns {Object} { score: number (0-5), feedback: string[] }
 */
export function calculatePasswordStrength(password) {
  let score = 0;
  const feedback = [];

  if (!password) {
    return { score: 0, feedback: ['Password is required'] };
  }

  // Length checks
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Use both uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[^a-zA-Z\d]/.test(password)) {
    score++;
  } else {
    feedback.push('Include special characters (!@#$%^&*)');
  }

  // Provide strength description
  let strength;
  if (score <= 1) strength = 'Very Weak';
  else if (score === 2) strength = 'Weak';
  else if (score === 3) strength = 'Fair';
  else if (score === 4) strength = 'Strong';
  else strength = 'Very Strong';

  return {
    score,
    strength,
    feedback: feedback.length > 0 ? feedback : ['Password looks good!']
  };
}
