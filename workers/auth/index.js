// workers/auth/index.js
// Authentication Worker - handles user signup, login, token refresh

import {
generateAccessToken,
generateRefreshToken,
verifyToken,
hashPassword,
verifyPassword,
isValidEmail,
validatePassword,
sanitizeUserForToken,
createErrorResponse,
createSuccessResponse
} from ‘../../shared/auth-helpers.js’;

import {
getSupabaseClient,
getUserByEmail,
createUser,
getUserById
} from ‘../../shared/database-helpers.js’;

import { CORS_HEADERS, HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from ‘../../shared/constants.js’;

export default {
async fetch(request, env, ctx) {
// Handle CORS preflight
if (request.method === ‘OPTIONS’) {
return new Response(null, { headers: CORS_HEADERS });
}

const url = new URL(request.url);
const path = url.pathname;

try {
  // Route requests
  if (path === '/signup' && request.method === 'POST') {
    return await handleSignup(request, env);
  }
  
  if (path === '/login' && request.method === 'POST') {
    return await handleLogin(request, env);
  }
  
  if (path === '/refresh' && request.method === 'POST') {
    return await handleRefreshToken(request, env);
  }
  
  if (path === '/verify' && request.method === 'GET') {
    return await handleVerifyToken(request, env);
  }
  
  if (path === '/logout' && request.method === 'POST') {
    return await handleLogout(request, env);
  }

  return createErrorResponse('Route not found', HTTP_STATUS.NOT_FOUND);
  
} catch (error) {
  console.error('Auth Worker Error:', error);
  return createErrorResponse(
    error.message || 'Internal server error',
    HTTP_STATUS.INTERNAL_ERROR
  );
}

}
};

/**

- Handle user signup
  */
  async function handleSignup(request, env) {
  const body = await request.json();
  const { email, password, name } = body;

// Validate input
if (!email || !password || !name) {
return createErrorResponse(‘Email, password, and name are required’, HTTP_STATUS.BAD_REQUEST);
}

if (!isValidEmail(email)) {
return createErrorResponse(‘Invalid email format’, HTTP_STATUS.BAD_REQUEST);
}

const passwordValidation = validatePassword(password);
if (!passwordValidation.valid) {
return createErrorResponse(
passwordValidation.errors.join(’, ’),
HTTP_STATUS.BAD_REQUEST
);
}

const supabase = getSupabaseClient(env);

// Check if user already exists
const existingUser = await getUserByEmail(supabase, email);
if (existingUser) {
return createErrorResponse(‘User already exists’, HTTP_STATUS.CONFLICT);
}

// Hash password and create user
const passwordHash = await hashPassword(password);
const newUser = await createUser(supabase, {
email,
passwordHash,
name,
plan: ‘free’
});

// Generate tokens
const userPayload = sanitizeUserForToken(newUser);
const accessToken = await generateAccessToken(userPayload);
const refreshToken = await generateRefreshToken(userPayload);

return createSuccessResponse({
message: SUCCESS_MESSAGES.USER_CREATED,
user: userPayload,
accessToken,
refreshToken
}, HTTP_STATUS.CREATED);
}

/**

- Handle user login
  */
  async function handleLogin(request, env) {
  const body = await request.json();
  const { email, password } = body;

// Validate input
if (!email || !password) {
return createErrorResponse(‘Email and password are required’, HTTP_STATUS.BAD_REQUEST);
}

const supabase = getSupabaseClient(env);

// Get user from database
const user = await getUserByEmail(supabase, email);
if (!user) {
return createErrorResponse(‘Invalid credentials’, HTTP_STATUS.UNAUTHORIZED);
}

// Verify password
const isPasswordValid = await verifyPassword(password, user.password_hash);
if (!isPasswordValid) {
return createErrorResponse(‘Invalid credentials’, HTTP_STATUS.UNAUTHORIZED);
}

// Generate tokens
const userPayload = sanitizeUserForToken(user);
const accessToken = await generateAccessToken(userPayload);
const refreshToken = await generateRefreshToken(userPayload);

return createSuccessResponse({
message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
user: userPayload,
accessToken,
refreshToken
});
}

/**

- Handle token refresh
  */
  async function handleRefreshToken(request, env) {
  const body = await request.json();
  const { refreshToken } = body;

if (!refreshToken) {
return createErrorResponse(‘Refresh token is required’, HTTP_STATUS.BAD_REQUEST);
}

try {
// Verify refresh token
const payload = await verifyToken(refreshToken);


if (payload.type !== 'refresh') {
  return createErrorResponse('Invalid token type', HTTP_STATUS.UNAUTHORIZED);
}

const supabase = getSupabaseClient(env);

// Get fresh user data
const user = await getUserById(supabase, payload.id);
if (!user) {
  return createErrorResponse('User not found', HTTP_STATUS.NOT_FOUND);
}

// Generate new tokens
const userPayload = sanitizeUserForToken(user);
const newAccessToken = await generateAccessToken(userPayload);
const newRefreshToken = await generateRefreshToken(userPayload);

return createSuccessResponse({
  accessToken: newAccessToken,
  refreshToken: newRefreshToken,
  user: userPayload
});


} catch (error) {
return createErrorResponse(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
}
}

/**

- Handle token verification
  */
  async function handleVerifyToken(request, env) {
  try {
  const authHeader = request.headers.get(‘Authorization’);
  if (!authHeader) {
  return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
  
  const token = authHeader.replace(’Bearer ’, ‘’);
  const payload = await verifyToken(token);
  
  if (payload.type === ‘refresh’) {
  return createErrorResponse(‘Invalid token type’, HTTP_STATUS.UNAUTHORIZED);
  }
  
  return createSuccessResponse({
  valid: true,
  user: payload
  });

} catch (error) {
return createErrorResponse(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
}
}

/**

- Handle logout
  */
  async function handleLogout(request, env) {
  // In a stateless JWT system, logout is handled client-side by removing tokens
  // This endpoint exists for consistency and future token blacklisting if needed

return createSuccessResponse({
message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
});
}
