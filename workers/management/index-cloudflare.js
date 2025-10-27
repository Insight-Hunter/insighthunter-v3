import { UserSession } from "./durable-objects/user-session.js";

export { UserSession };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function fetch(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Durable Object user session routes
  if (path.startsWith("/api/session")) {
    const userSessionId = extractUserIdFromRequest(request);
    if (!userSessionId) {
      return jsonResponse(
        { error: "Unauthorized: Missing user session ID" },
        401
      );
    }
    const durableId = env.USER_SESSION.idFromName(userSessionId);
    const durableObject = env.USER_SESSION.get(durableId);
    return durableObject.fetch(request);
  }

  // Client management routes
  if (path.startsWith("/api/clients")) {
    return handleClients(request, env, corsHeaders);
  }

  // Alerts management
  if (path.startsWith("/api/alerts")) {
    return handleAlerts(request, env, corsHeaders);
  }

  // User profile and settings
  if (path.startsWith("/api/user")) {
    return handleUser(request, env, corsHeaders);
  }

  // Health check
  if (path === "/health") {
    return jsonResponse({ status: "ok", service: "management" }, 200);
  }

  return jsonResponse({ error: "Not found" }, 404);
}

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
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

// ================ Clients Handler ==================

async function handleClients(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const userId = await verifyAuth(request, env);
  if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

  if (method === "GET" && path === "/api/clients") {
    const clients = await env.DB.prepare(
      "SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(userId)
    .all();
    return jsonResponse({ clients: clients.results }, 200);
  }

  if (method === "POST" && path === "/api/clients") {
    const data = await request.json();
    const { name, email, phone, business_name, tags } = data;

    const result = await env.DB.prepare(
      `INSERT INTO clients (user_id, name, email, phone, business_name, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      userId,
      name,
      email || null,
      phone || null,
      business_name || null,
      tags ? JSON.stringify(tags) : null
    )
    .run();

    return jsonResponse({ success: true, client_id: result.meta.last_row_id }, 201);
  }

  const clientIdMatch = path.match(/^\/api\/clients\/(\d+)$/);
  if (clientIdMatch) {
    const clientId = clientIdMatch[1];

    if (method === "GET") {
      const client = await env.DB.prepare(
        "SELECT * FROM clients WHERE id = ? AND user_id = ?"
      )
      .bind(clientId, userId)
      .first();
      if (!client) return jsonResponse({ error: "Client not found" }, 404);
      return jsonResponse({ client }, 200);
    }

    if (method === "PUT") {
      const data = await request.json();
      const { name, email, phone, business_name, tags, status } = data;

      await env.DB.prepare(
        `UPDATE clients 
         SET name = ?, email = ?, phone = ?, business_name = ?, tags = ?, status = ?
         WHERE id = ? AND user_id = ?`
      )
      .bind(
        name,
        email || null,
        phone || null,
        business_name || null,
        tags ? JSON.stringify(tags) : null,
        status || "active",
        clientId,
        userId
      )
      .run();
      return jsonResponse({ success: true }, 200);
    }

    if (method === "DELETE") {
      await env.DB.prepare("DELETE FROM clients WHERE id = ? AND user_id = ?")
        .bind(clientId, userId)
        .run();
      return jsonResponse({ success: true }, 200);
    }
  }

  return jsonResponse({ error: "Invalid endpoint" }, 404);
}

// ================ Alerts Handler ==================

async function handleAlerts(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const userId = await verifyAuth(request, env);
  if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

  if (method === "GET" && path === "/api/alerts") {
    const status = url.searchParams.get("status") || "active";
    const alerts = await env.DB.prepare(
      `SELECT * FROM alerts WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 100`
    )
    .bind(userId, status)
    .all();
    return jsonResponse({ alerts: alerts.results }, 200);
  }

  if (method === "POST" && path === "/api/alerts") {
    const data = await request.json();
    const { type, title, message, severity, metadata } = data;
    const result = await env.DB.prepare(
      `INSERT INTO alerts (user_id, type, title, message, severity, metadata, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', datetime('now'))`
    )
    .bind(
      userId,
      type,
      title,
      message,
      severity || "info",
      metadata ? JSON.stringify(metadata) : null
    )
    .run();
    return jsonResponse({ success: true, alert_id: result.meta.last_row_id }, 201);
  }

  const alertIdMatch = path.match(/^\/api\/alerts\/(\d+)$/);
  if (alertIdMatch) {
    const alertId = alertIdMatch[1];

    if (method === "PUT") {
      const data = await request.json();
      const { status } = data;
      await env.DB.prepare("UPDATE alerts SET status = ? WHERE id = ? AND user_id = ?")
        .bind(status, alertId, userId)
        .run();
      return jsonResponse({ success: true }, 200);
    }

    if (method === "DELETE") {
      await env.DB.prepare("DELETE FROM alerts WHERE id = ? AND user_id = ?")
        .bind(alertId, userId)
        .run();
      return jsonResponse({ success: true }, 200);
    }
  }

  return jsonResponse({ error: "Invalid endpoint" }, 404);
}

// ================ User Handler ==================

async function handleUser(request, env, corsHeaders) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const userId = await verifyAuth(request, env);
  if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

  if (method === "GET" && path === "/api/user/profile") {
    const user = await env.DB.prepare(
      "SELECT id, email, name, created_at, settings FROM users WHERE id = ?"
    )
    .bind(userId)
    .first();
    if (!user) return jsonResponse({ error: "User not found" }, 404);
    return jsonResponse({ user }, 200);
  }

  if (method === "PUT" && path === "/api/user/profile") {
    const data = await request.json();
    const { name, settings } = data;
    await env.DB.prepare("UPDATE users SET name = ?, settings = ? WHERE id = ?")
      .bind(name, settings ? JSON.stringify(settings) : null, userId)
      .run();
    return jsonResponse({ success: true }, 200);
  }

  if (method === "GET" && path === "/api/user/stats") {
    const stats = await getUserStats(env, userId);
    return jsonResponse({ stats }, 200);
  }

  return jsonResponse({ error: "Invalid endpoint" }, 404);
}

// ================ Helper functions ==================

async function verifyAuth(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  try {
    const session = await env.KV.get(`session:${token}`);
    if (!session) return null;

    const sessionData = JSON.parse(session);
    return sessionData.userId;
  } catch {
    return null;
  }
}

async function getUserStats(env, userId) {
  const txCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM transactions WHERE user_id = ?")
    .bind(userId)
    .first();
  const clientCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM clients WHERE user_id = ?")
    .bind(userId)
    .first();
  const alertCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM alerts WHERE user_id = ? AND status = 'active'")
    .bind(userId)
    .first();
  const totalAmount = await env.DB.prepare(
    `SELECT SUM(amount) AS total FROM transactions WHERE user_id = ? AND date >= date('now', '-30 days')`
  )
  .bind(userId)
  .first();

  return {
    transactions: txCount?.count || 0,
    clients: clientCount?.count || 0,
    active_alerts: alertCount?.count || 0,
    total_amount_30d: totalAmount?.total || 0,
  };
}
