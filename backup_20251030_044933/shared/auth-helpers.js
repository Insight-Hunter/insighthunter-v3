// shared/auth-helpers.js
// JWT authentication helpers shared across Workers

import { SignJWT, jwtVerify } from ‘jose’;

const JWT_SECRET_KEY = new TextEncoder().encode(
process.env.JWT_SECRET || ‘your-secret-key-change-in-production’
);

const JWT_ALGORITHM = ‘HS256’;
const TOKEN_EXPIRY = ‘7d’; // 7 days
const REFRESH_TOKEN_EXPIRY = ‘30d’; // 30 days

/**

- Generate a JWT access token
- @param {object} payload - User data to encode in token
- @returns {Promise<string>} - Signed JWT token
  */
  export async function generateAccessToken(payload) {
  const jwt = await new SignJWT(payload)
  .setProtectedHeader({ alg: JWT_ALGORITHM })
  .setIssuedAt()
  .setExpirationTime(TOKEN_EXPIRY)
  .sign(JWT_SECRET_KEY);

return jwt;
}

/**

- Generate a JWT refresh token
- @param {object} payload - User data to encode in token
- @returns {Promise<string>} - Signed refresh token
  */
  export async function generateRefreshToken(payload) {
  const jwt = await new SignJWT({ …payload, type: ‘refresh’ })
  .setProtectedHeader({ alg: JWT_ALGORITHM })
  .setIssuedAt()
  .setExpirationTime(REFRESH_TOKEN_EXPIRY)
  .sign(JWT_SECRET_KEY);

return jwt;
}

/**

- Verify and decode a JWT token
- @param {string} token - JWT token to verify
- @returns {Promise<object>} - Decoded payload
- @throws {Error} - If token is invalid or expired
  */
  export async function verifyToken(token) {
  try {
  const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
  return payload;
  } catch (error) {
  throw new Error(`Token verification failed: ${error.message}`);
  }
  }

/**

- Extract token from Authorization header
- @param {Request} request - HTTP request object
- @returns {string|null} - Token string or null
  */
  export function extractTokenFromHeader(request) {
  const authHeader = request.headers.get(‘Authorization’);

if (!authHeader) {
return null;
}

// Handle “Bearer <token>” format
const match = authHeader.match(/^Bearer\s+(.+)$/i);
return match ? match[1] : authHeader;
}

/**

- Middleware to authenticate requests
- @param {Request} request - HTTP request object
- @returns {Promise<object>} - User data from token
- @throws {Error} - If authentication fails
  */
  export async function authenticateRequest(request) {
  const token = extractTokenFromHeader(request);

if (!token) {
throw new Error(‘No authentication token provided’);
}

try {
const userData = await verifyToken(token);


// Check if token is a refresh token (not allowed for regular requests)
if (userData.type === 'refresh') {
  throw new Error('Invalid token type');
}

return userData;


} catch (error) {
throw new Error(`Authentication failed: ${error.message}`);
}
}

/**

- Hash a password using Web Crypto API
- @param {string} password - Plain text password
- @returns {Promise<string>} - Hashed password (hex string)
  */
  export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest(‘SHA-256’, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, ‘0’)).join(’’);
  return hashHex;
  }

/**

- Verify a password against a hash
- @param {string} password - Plain text password
- @param {string} hash - Stored password hash
- @returns {Promise<boolean>} - True if password matches
  */
  export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
  }

/**

- Create standardized error response
- @param {string} message - Error message
- @param {number} status - HTTP status code
- @returns {Response} - JSON error response
  */
  export function createErrorResponse(message, status = 400) {
  return new Response(
  JSON.stringify({
  error: message,
  status
  }),
  {
  status,
  headers: {
  ‘Content-Type’: ‘application/json’,
  ‘Access-Control-Allow-Origin’: ’*’
  }
  }
  );
  }

/**

- Create standardized success response
- @param {object} data - Response data
- @param {number} status - HTTP status code
- @returns {Response} - JSON success response
  */
  export function createSuccessResponse(data, status = 200) {
  return new Response(
  JSON.stringify(data),
  {
  status,
  headers: {
  ‘Content-Type’: ‘application/json’,
  ‘Access-Control-Allow-Origin’: ’*’
  }
  }
  );
  }

/**

- Validate email format
- @param {string} email - Email address to validate
- @returns {boolean} - True if valid email format
  */
  export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  return emailRegex.test(email);
  }

/**

- Validate password strength
- @param {string} password - Password to validate
- @returns {object} - { valid: boolean, errors: string[] }
  */
  export function validatePassword(password) {
  const errors = [];

if (password.length < 8) {
errors.push(‘Password must be at least 8 characters long’);
}

if (!/[A-Z]/.test(password)) {
errors.push(‘Password must contain at least one uppercase letter’);
}

if (!/[a-z]/.test(password)) {
errors.push(‘Password must contain at least one lowercase letter’);
}

if (!/[0-9]/.test(password)) {
errors.push(‘Password must contain at least one number’);
}

return {
valid: errors.length === 0,
errors
};
}

/**

- Sanitize user data for token payload (remove sensitive info)
- @param {object} user - User object from database
- @returns {object} - Safe user data for token
  */
  export function sanitizeUserForToken(user) {
  return {
  id: user.id,
  email: user.email,
  name: user.name,
  plan: user.plan || ‘free’,
  organizationId: user.organization_id
  };
  }
