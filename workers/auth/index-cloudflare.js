// workers/auth/index-cloudflare.js
// Authentication Worker with D1 + KV

export default {
async fetch(request, env, ctx) {
// CORS headers
const corsHeaders = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Methods’: ‘GET, POST, PUT, DELETE, OPTIONS’,
‘Access-Control-Allow-Headers’: ‘Content-Type, Authorization’,
};

```
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

const url = new URL(request.url);
const path = url.pathname;

try {
  if (path === '/signup' && request.method === 'POST') {
    return await handleSignup(request, env, corsHeaders);
  }
  
  if (path === '/login' && request.method === 'POST') {
    return await handleLogin(request, env, corsHeaders);
  }
  
  if (path === '/refresh' && request.method === 'POST') {
    return await handleRefresh(request, env, corsHeaders);
  }
  
  if (path === '/verify' && request.method === 'GET') {
    return await handleVerify(request, env, corsHeaders);
  }
  
  if (path === '/logout' && request.method === 'POST') {
    return await handleLogout(request, env, corsHeaders);
  }

  return jsonResponse({ error: 'Route not found' }, 404, corsHeaders);
  
} catch (error) {
  console.error('Auth Error:', error);
  return jsonResponse({ error: error.message }, 500, corsHeaders);
}
```

}
};

/**

- Handle user signup
  */
  async function handleSignup(request, env, corsHeaders) {
  const { email, password, name } = await request.json();

// Validate input
if (!email || !password || !name) {
return jsonResponse({ error: ‘Email, password, and name are required’ }, 400, corsHeaders);
}

if (!isValidEmail(email)) {
return jsonResponse({ error: ‘Invalid email format’ }, 400, corsHeaders);
}

const passwordValidation = validatePassword(password);
if (!passwordValidation.valid) {
return jsonResponse({ error: passwordValidation.errors.join(’, ’) }, 400, corsHeaders);
}

// Check if user exists
const existing = await env.DB.prepare(
‘SELECT id FROM users WHERE email = ?’
).bind(email).first();

if (existing) {
return jsonResponse({ error: ‘User already exists’ }, 409, corsHeaders);
}

// Hash password
const passwordHash = await hashPassword(password);

// Create user
const userId = crypto.randomUUID();
await env.DB.prepare(
`INSERT INTO users (id, email, password_hash, name, plan, created_at)  VALUES (?, ?, ?, ?, 'free', unixepoch())`
).bind(userId, email, passwordHash, name).run();

// Create session
const session = await createSession(env, { id: userId, email, name, plan: ‘free’ });

return jsonResponse({
message: ‘User created successfully’,
user: { id: userId, email, name, plan: ‘free’ },
sessionId: session.id,
expiresAt: session.expiresAt
}, 201, corsHeaders);
}

/**

- Handle user login
  */
  async function handleLogin(request, env, corsHeaders) {
  const { email, password } = await request.json();

if (!email || !password) {
return jsonResponse({ error: ‘Email and password are required’ }, 400, corsHeaders);
}

// Get user
const user = await env.DB.prepare(
‘SELECT * FROM users WHERE email = ? AND deleted_at IS NULL’
).bind(email).first();

if (!user) {
return jsonResponse({ error: ‘Invalid credentials’ }, 401, corsHeaders);
}

// Verify password
const isValid = await verifyPassword(password, user.password_hash);
if (!isValid) {
return jsonResponse({ error: ‘Invalid credentials’ }, 401, corsHeaders);
}

// Create session
const session = await createSession(env, {
id: user.id,
email: user.email,
name: user.name,
plan: user.plan
});

return jsonResponse({
message: ‘Login successful’,
user: {
id: user.id,
email: user.email,
name: user.name,
plan: user.plan
},
sessionId: session.id,
expiresAt: session.expiresAt
}, 200, corsHeaders);
}

/**

- Handle session refresh
  */
  async function handleRefresh(request, env, corsHeaders) {
  const { sessionId } = await request.json();

if (!sessionId) {
return jsonResponse({ error: ‘Session ID required’ }, 400, corsHeaders);
}

// Get session from KV
const sessionData = await env.KV.get(`session:${sessionId}`, ‘json’);

if (!sessionData) {
return jsonResponse({ error: ‘Invalid or expired session’ }, 401, corsHeaders);
}

// Refresh session (extend expiry)
const newSession = await createSession(env, sessionData.user, sessionId);

return jsonResponse({
sessionId: newSession.id,
expiresAt: newSession.expiresAt,
user: sessionData.user
}, 200, corsHeaders);
}

/**

- Handle session verification
  */
  async function handleVerify(request, env, corsHeaders) {
  const sessionId = request.headers.get(‘Authorization’)?.replace(’Bearer ’, ‘’);

if (!sessionId) {
return jsonResponse({ error: ‘No session provided’ }, 401, corsHeaders);
}

const sessionData = await env.KV.get(`session:${sessionId}`, ‘json’);

if (!sessionData) {
return jsonResponse({ error: ‘Invalid or expired session’ }, 401, corsHeaders);
}

return jsonResponse({
valid: true,
user: sessionData.user
}, 200, corsHeaders);
}

/**

- Handle logout
  */
  async function handleLogout(request, env, corsHeaders) {
  const sessionId = request.headers.get(‘Authorization’)?.replace(’Bearer ’, ‘’);

if (sessionId) {
// Delete session from KV
await env.KV.delete(`session:${sessionId}`);
}

return jsonResponse({
message: ‘Logout successful’
}, 200, corsHeaders);
}

/**

- Create session in KV
  */
  async function createSession(env, user, existingSessionId = null) {
  const sessionId = existingSessionId || crypto.randomUUID();
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

const sessionData = {
user,
createdAt: Date.now(),
expiresAt
};

// Store in KV with TTL
await env.KV.put(
`session:${sessionId}`,
JSON.stringify(sessionData),
{ expirationTtl: 7 * 24 * 60 * 60 } // 7 days in seconds
);

// Track active sessions count for rate limiting
await env.KV.put(`user_sessions:${user.id}`, Date.now().toString(), {
expirationTtl: 7 * 24 * 60 * 60
});

return { id: sessionId, expiresAt };
}

/**

- Hash password using Web Crypto API
  */
  async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest(‘SHA-256’, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, ‘0’)).join(’’);
  }

/**

- Verify password
  */
  async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
  }

/**

- Validate email format
  */
  function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  return emailRegex.test(email);
  }

/**

- Validate password strength
  */
  function validatePassword(password) {
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

return { valid: errors.length === 0, errors };
}

/**

- JSON response helper
  */
  function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
  status,
  headers: {
  ‘Content-Type’: ‘application/json’,
  …headers
  }
  });
  }
