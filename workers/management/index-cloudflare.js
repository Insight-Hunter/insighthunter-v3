// Insight Hunter v3 - Management Worker
// Handles: Client Management, Alerts, User Settings

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route handling
      if (path.startsWith('/api/clients')) {
        return handleClients(request, env, corsHeaders);
      } else if (path.startsWith('/api/alerts')) {
        return handleAlerts(request, env, corsHeaders);
      } else if (path.startsWith('/api/user')) {
        return handleUser(request, env, corsHeaders);
      } else if (path === '/health') {
        return jsonResponse({ status: 'ok', service: 'management' }, 200, corsHeaders);
      } else {
        return jsonResponse({ error: 'Not found' }, 404, corsHeaders);
      }
    } catch (error) {
      console.error('Management worker error:', error);
      return jsonResponse({ error: error.message }, 500, corsHeaders);
    }
  },
};

// ============================================
// CLIENT MANAGEMENT
// ============================================

async function handleClients(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Verify authentication
  const userId = await verifyAuth(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  // GET /api/clients - List all clients
  if (method === 'GET' && path === '/api/clients') {
    const clients = await env.DB.prepare(
      'SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return jsonResponse({ clients: clients.results }, 200, corsHeaders);
  }

  // POST /api/clients - Create new client
  if (method === 'POST' && path === '/api/clients') {
    const data = await request.json();
    const { name, email, phone, business_name, tags } = data;

    const result = await env.DB.prepare(
      `INSERT INTO clients (user_id, name, email, phone, business_name, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      userId,
      name,
      email || null,
      phone || null,
      business_name || null,
      tags ? JSON.stringify(tags) : null
    ).run();

    return jsonResponse({ 
      success: true, 
      client_id: result.meta.last_row_id 
    }, 201, corsHeaders);
  }

  // GET /api/clients/:id - Get client details
  const clientIdMatch = path.match(/^\/api\/clients\/(\d+)$/);
  if (method === 'GET' && clientIdMatch) {
    const clientId = clientIdMatch[1];

    const client = await env.DB.prepare(
      'SELECT * FROM clients WHERE id = ? AND user_id = ?'
    ).bind(clientId, userId).first();

    if (!client) {
      return jsonResponse({ error: 'Client not found' }, 404, corsHeaders);
    }

    return jsonResponse({ client }, 200, corsHeaders);
  }

  // PUT /api/clients/:id - Update client
  if (method === 'PUT' && clientIdMatch) {
    const clientId = clientIdMatch[1];
    const data = await request.json();

    const { name, email, phone, business_name, tags, status } = data;

    await env.DB.prepare(
      `UPDATE clients 
       SET name = ?, email = ?, phone = ?, business_name = ?, tags = ?, status = ?
       WHERE id = ? AND user_id = ?`
    ).bind(
      name,
      email || null,
      phone || null,
      business_name || null,
      tags ? JSON.stringify(tags) : null,
      status || 'active',
      clientId,
      userId
    ).run();

    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  // DELETE /api/clients/:id - Delete client
  if (method === 'DELETE' && clientIdMatch) {
    const clientId = clientIdMatch[1];

    await env.DB.prepare(
      'DELETE FROM clients WHERE id = ? AND user_id = ?'
    ).bind(clientId, userId).run();

    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  return jsonResponse({ error: 'Invalid endpoint' }, 404, corsHeaders);
}

// ============================================
// ALERTS MANAGEMENT
// ============================================

async function handleAlerts(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const userId = await verifyAuth(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  // GET /api/alerts - List alerts
  if (method === 'GET' && path === '/api/alerts') {
    const status = url.searchParams.get('status') || 'active';

    const alerts = await env.DB.prepare(
      `SELECT * FROM alerts 
       WHERE user_id = ? AND status = ? 
       ORDER BY created_at DESC LIMIT 100`
    ).bind(userId, status).all();

    return jsonResponse({ alerts: alerts.results }, 200, corsHeaders);
  }

  // POST /api/alerts - Create alert
  if (method === 'POST' && path === '/api/alerts') {
    const data = await request.json();
    const { type, title, message, severity, metadata } = data;

    const result = await env.DB.prepare(
      `INSERT INTO alerts (user_id, type, title, message, severity, metadata, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'))`
    ).bind(
      userId,
      type,
      title,
      message,
      severity || 'info',
      metadata ? JSON.stringify(metadata) : null
    ).run();

    return jsonResponse({ 
      success: true, 
      alert_id: result.meta.last_row_id 
    }, 201, corsHeaders);
  }

  // PUT /api/alerts/:id - Update alert status
  const alertIdMatch = path.match(/^\/api\/alerts\/(\d+)$/);
  if (method === 'PUT' && alertIdMatch) {
    const alertId = alertIdMatch[1];
    const data = await request.json();
    const { status } = data;

    await env.DB.prepare(
      'UPDATE alerts SET status = ? WHERE id = ? AND user_id = ?'
    ).bind(status, alertId, userId).run();

    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  // DELETE /api/alerts/:id - Delete alert
  if (method === 'DELETE' && alertIdMatch) {
    const alertId = alertIdMatch[1];

    await env.DB.prepare(
      'DELETE FROM alerts WHERE id = ? AND user_id = ?'
    ).bind(alertId, userId).run();

    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  return jsonResponse({ error: 'Invalid endpoint' }, 404, corsHeaders);
}

// ============================================
// USER SETTINGS
// ============================================

async function handleUser(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const userId = await verifyAuth(request, env);
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
  }

  // GET /api/user/profile
  if (method === 'GET' && path === '/api/user/profile') {
    const user = await env.DB.prepare(
      'SELECT id, email, name, created_at, settings FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404, corsHeaders);
    }

    return jsonResponse({ user }, 200, corsHeaders);
  }

  // PUT /api/user/profile - Update profile
  if (method === 'PUT' && path === '/api/user/profile') {
    const data = await request.json();
    const { name, settings } = data;

    await env.DB.prepare(
      'UPDATE users SET name = ?, settings = ? WHERE id = ?'
    ).bind(
      name,
      settings ? JSON.stringify(settings) : null,
      userId
    ).run();

    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  // GET /api/user/stats - User statistics
  if (method === 'GET' && path === '/api/user/stats') {
    const stats = await getUserStats(env, userId);
    return jsonResponse({ stats }, 200, corsHeaders);
  }

  return jsonResponse({ error: 'Invalid endpoint' }, 404, corsHeaders);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT (simplified - use proper JWT library in production)
    const session = await env.KV.get(`session:${token}`);
    if (!session) {
      return null;
    }

    const sessionData = JSON.parse(session);
    return sessionData.userId;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

async function getUserStats(env, userId) {
  // Get transaction count
  const txCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?'
  ).bind(userId).first();

  // Get client count
  const clientCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM clients WHERE user_id = ?'
  ).bind(userId).first();

  // Get alert count
  const alertCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND status = "active"'
  ).bind(userId).first();

  // Get total transaction amount (last 30 days)
  const totalAmount = await env.DB.prepare(
    `SELECT SUM(amount) as total FROM transactions 
     WHERE user_id = ? AND date >= date('now', '-30 days')`
  ).bind(userId).first();

  return {
    transactions: txCount?.count || 0,
    clients: clientCount?.count || 0,
    active_alerts: alertCount?.count || 0,
    total_amount_30d: totalAmount?.total || 0,
  };
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}