import { UserSession } from "./durable-objects/user-session.js";

export { UserSession };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function fetch(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Route session-related Durable Object API calls
  if (path.startsWith("/api/session")) {
    const userSessionId = extractUserIdFromRequest(request);
    if (!userSessionId) {
      return jsonResponse({ error: "Unauthorized: No user session ID" }, 401);
    }

    const durableId = env.USER_SESSION.idFromName(userSessionId);
    const durableObject = env.USER_SESSION.get(durableId);
    return durableObject.fetch(request);
  }

  try {
    // Other API route handlers
    if (path.startsWith('/api/clients')) {
      return handleClients(request, env, corsHeaders);
    } else if (path.startsWith('/api/alerts')) {
      return handleAlerts(request, env, corsHeaders);
    } else if (path.startsWith('/api/user')) {
      return handleUser(request, env, corsHeaders);
    } else if (path === '/health') {
      return jsonResponse({ status: 'ok', service: 'management' }, 200);
    } else {
      return jsonResponse({ error: 'Not found' }, 404);
    }
  } catch (error) {
    console.error('Management worker error:', error);
    return jsonResponse({ error: error.message }, 500);
  }
}

// Extract userId from Authorization header JWT
function extractUserIdFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}
