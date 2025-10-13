// workers/auth/index.js
// Main entry point for the authentication Worker

import { hashPassword, verifyPassword } from ‘./password.js’;
import { generateJWT, verifyJWT } from ‘./jwt.js’;
import { validateEmail, validatePassword, validateName } from ‘./validation.js’;

/**

- CORS headers for cross-origin requests
  */
  const CORS_HEADERS = {
  ‘Access-Control-Allow-Origin’: ’*’,
  ‘Access-Control-Allow-Methods’: ‘GET, POST, OPTIONS’,
  ‘Access-Control-Allow-Headers’: ‘Content-Type, Authorization’
  };

/**

- Handle CORS preflight requests
  */
  function handleOptions() {
  return new Response(null, {
  headers: CORS_HEADERS
  });
  }

/**

- Create error response
  */
  function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
  status,
  headers: {
  ‘Content-Type’: ‘application/json’,
  …CORS_HEADERS
  }
  });
  }

/**

- Create success response
  */
  function successResponse(data, status = 200) {
  return new Response(JSON.stringify({ success: true, …data }), {
  status,
  headers: {
  ‘Content-Type’: ‘application/json’,
  …CORS_HEADERS
  }
  });
  }

/**

- Handle user registration
  */
  async function handleRegister(request, env) {
  try {
  const { email, password, name } = await request.json();
  
  // Validate input
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
  return errorResponse(emailValidation.error);
  }
  
  const nameValidation = validateName(name);
  if (!nameValidation.valid) {
  return errorResponse(nameValidation.error);
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
  return errorResponse(passwordValidation.error);
  }
  
  // Check if user already exists
  const existingUser = await env.DB.prepare(
  ‘SELECT id FROM users WHERE email = ?’
  ).bind(email.toLowerCase()).first();
  
  if (existingUser) {
  return errorResponse(‘An account with this email already exists’, 409);
  }
  
  // Hash the password
  const passwordHash = await hashPassword(password);
  
  // Create the user
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
  `INSERT INTO users  (email, password_hash, name, plan_type, created_at, updated_at)  VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
  email.toLowerCase(),
  passwordHash,
  name,
  ‘free’, // Default plan
  now,
  now
  ).run();
  
  const userId = result.meta.last_row_id;
  
  // Generate JWT token
  const token = await generateJWT(userId, email.toLowerCase(), env.JWT_SECRET);
  
  return successResponse({
  token,
  user: {
  id: userId,
  email: email.toLowerCase(),
  name,
  plan_type: ‘free’
  }
  }, 201);

} catch (error) {
console.error(‘Registration error:’, error);
return errorResponse(’Registration failed: ’ + error.message, 500);
}
}

/**

- Handle user login
  */
  async function handleLogin(request, env) {
  try {
  const { email, password } = await request.json();
  
  // Validate input
  if (!email || !password) {
  return errorResponse(‘Email and password are required’);
  }
  
  // Look up the user
  const user = await env.DB.prepare(
  ‘SELECT id, email, password_hash, name, plan_type FROM users WHERE email = ?’
  ).bind(email.toLowerCase()).first();
  
  if (!user) {
  return errorResponse(‘Invalid email or password’, 401);
  }
  
  // Verify the password
  const isValidPassword = await verifyPassword(password, user.password_hash);
  
  if (!isValidPassword) {
  return errorResponse(‘Invalid email or password’, 401);
  }
  
  // Generate JWT token
  const token = await generateJWT(user.id, user.email, env.JWT_SECRET);
  
  // Update last login time
  await env.DB.prepare(
  ‘UPDATE users SET updated_at = ? WHERE id = ?’
  ).bind(new Date().toISOString(), user.id).run();
  
  return successResponse({
  token,
  user: {
  id: user.id,
  email: user.email,
  name: user.name,
  plan_type: user.plan_type
  }
  });

} catch (error) {
console.error(‘Login error:’, error);
return errorResponse(’Login failed: ’ + error.message, 500);
}
}

/**

- Handle token verification
  */
  async function handleVerify(request, env) {
  try {
  // Extract token from Authorization header
  const authHeader = request.headers.get(‘Authorization’);
  
  if (!authHeader || !authHeader.startsWith(’Bearer ’)) {
  return errorResponse(‘No token provided’, 401);
  }
  
  const token = authHeader.substring(7);
  
  // Verify the token
  const payload = await verifyJWT(token, env.JWT_SECRET);
  
  if (!payload) {
  return errorResponse(‘Invalid or expired token’, 401);
  }
  
  // Look up the user to get current info
  const user = await env.DB.prepare(
  ‘SELECT id, email, name, plan_type, plan_expires_at FROM users WHERE id = ?’
  ).bind(payload.userId).first();
  
  if (!user) {
  return errorResponse(‘User not found’, 404);
  }
  
  return successResponse({
  user: {
  id: user.id,
  email: user.email,
  name: user.name,
  plan_type: user.plan_type,
  plan_expires_at: user.plan_expires_at
  }
  });

} catch (error) {
console.error(‘Verification error:’, error);
return errorResponse(’Verification failed: ’ + error.message, 500);
}
}

/**

- Handle password reset request
  */
  async function handlePasswordResetRequest(request, env) {
  try {
  const { email } = await request.json();
  
  if (!email) {
  return errorResponse(‘Email is required’);
  }
  
  // Check if user exists
  const user = await env.DB.prepare(
  ‘SELECT id, email, name FROM users WHERE email = ?’
  ).bind(email.toLowerCase()).first();
  
  // Always return success to prevent email enumeration
  // In production, you would send an email here if user exists
  
  if (user) {
  // Generate a reset token (valid for 1 hour)
  const resetToken = await generateJWT(
  user.id,
  user.email,
  env.JWT_SECRET,
  3600 // 1 hour expiration
  );
  
  // In production, send email with reset link:
  // https://app.insighthunter.app/reset-password?token=${resetToken}
  console.log(‘Password reset requested for:’, user.email);
  console.log(‘Reset token:’, resetToken);
  }
  
  return successResponse({
  message: ‘If an account exists with that email, a password reset link has been sent’
  });

} catch (error) {
console.error(‘Password reset request error:’, error);
return errorResponse(‘Password reset request failed’, 500);
}
}

/**

- Handle password reset (with token)
  */
  async function handlePasswordReset(request, env) {
  try {
  const { token, newPassword } = await request.json();
  
  if (!token || !newPassword) {
  return errorResponse(‘Token and new password are required’);
  }
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
  return errorResponse(passwordValidation.error);
  }
  
  // Verify the reset token
  const payload = await verifyJWT(token, env.JWT_SECRET);
  
  if (!payload) {
  return errorResponse(‘Invalid or expired reset token’, 401);
  }
  
  // Hash the new password
  const passwordHash = await hashPassword(newPassword);
  
  // Update the password
  await env.DB.prepare(
  ‘UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?’
  ).bind(passwordHash, new Date().toISOString(), payload.userId).run();
  
  return successResponse({
  message: ‘Password reset successful’
  });

} catch (error) {
console.error(‘Password reset error:’, error);
return errorResponse(’Password reset failed: ’ + error.message, 500);
}
}

/**

- Main Worker fetch handler
  */
  export default {
  async fetch(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Handle CORS preflight
  if (request.method === ‘OPTIONS’) {
  return handleOptions();
  }
  
  try {
  // Route to appropriate handler
  if (pathname === ‘/auth/register’ && request.method === ‘POST’) {
  return await handleRegister(request, env);
  }
  
  if (pathname === ‘/auth/login’ && request.method === ‘POST’) {
  return await handleLogin(request, env);
  }
  
  if (pathname === ‘/auth/verify’ && request.method === ‘GET’) {
  return await handleVerify(request, env);
  }
  
  if (pathname === ‘/auth/password-reset-request’ && request.method === ‘POST’) {
  return await handlePasswordResetRequest(request, env);
  }
  
  if (pathname === ‘/auth/password-reset’ && request.method === ‘POST’) {
  return await handlePasswordReset(request, env);
  }
  
  // Route not found
  return errorResponse(‘Not found’, 404);
  
  } catch (error) {
  console.error(‘Worker error:’, error);
  return errorResponse(’Internal server error: ’ + error.message, 500);
  }
  }
  };
