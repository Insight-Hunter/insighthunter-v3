// workers/management/clients.js
// Client CRUD operations for fractional CFOs

/**
 * Get all clients for a user
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of client objects
 */
export async function getClients(db, userId) {
  const result = await db.prepare(`SELECT id, company_name, contact_email, contact_phone, status, created_at, updated_at FROM clients WHERE user_id = ? ORDER BY created_at DESC`).bind(userId).all();

  return result.results;
}

/**
 * Get a specific client by ID
 * @param {D1Database} db - Database binding
 * @param {number} clientId - Client ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Client object or null if not found
 */
export async function getClient(db, clientId, userId) {
  const client = await db.prepare(`SELECT * FROM clients WHERE id = ? AND user_id = ?`).bind(clientId, userId).first();

  if (!client) {
    return null;
  }

  // Get summary statistics for this client
  const stats = await db.prepare(`SELECT COUNT(*) as transaction_count, SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as total_revenue, SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expenses, MIN(date) as first_transaction_date, MAX(date) as last_transaction_date FROM transactions WHERE client_id = ?`).bind(clientId).first();

  return {
    ...client,
    stats: stats || {
      transaction_count: 0,
      total_revenue: 0,
      total_expenses: 0,
      first_transaction_date: null,
      last_transaction_date: null
    }
  };
}

/**
 * Create a new client
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {Object} clientData - Client information
 * @returns {Promise<Object>} Created client object
 */
export async function createClient(db, userId, clientData) {
  const { company_name, contact_email, contact_phone } = clientData;

  // Validate required fields
  if (!company_name) {
    throw new Error('Company name is required');
  }

  const now = new Date().toISOString();

  const result = await db.prepare(`INSERT INTO clients (user_id, company_name, contact_email, contact_phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
    userId,
    company_name,
    contact_email || null,
    contact_phone || null,
    'active',
    now,
    now
  ).run();

  return {
    id: result.meta.last_row_id,
    user_id: userId,
    company_name,
    contact_email,
    contact_phone,
    status: 'active',
    created_at: now,
    updated_at: now
  };
}

/**
 * Update an existing client
 * @param {D1Database} db - Database binding
 * @param {number} clientId - Client ID
 * @param {number} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated client object
 */
export async function updateClient(db, clientId, userId, updates) {
  // Verify client belongs to user
  const existing = await db.prepare(
    'SELECT id FROM clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).first();

  if (!existing) {
    throw new Error('Client not found or access denied');
  }

  // Build update query dynamically based on provided fields
  const allowedFields = ['company_name', 'contact_email', 'contact_phone', 'status'];
  const updateFields = [];
  const values = [];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Add updated_at timestamp
  updateFields.push('updated_at = ?');
  values.push(new Date().toISOString());

  // Add clientId and userId for WHERE clause
  values.push(clientId);
  values.push(userId);

  await db.prepare(`UPDATE clients SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`).bind(...values).run();

  // Return updated client
  return await getClient(db, clientId, userId);
}

/**
 * Delete a client (soft delete by setting status to archived)
 * @param {D1Database} db - Database binding
 * @param {number} clientId - Client ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteClient(db, clientId, userId) {
  // Verify client belongs to user
  const existing = await db.prepare(
    'SELECT id FROM clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).first();

  if (!existing) {
    throw new Error('Client not found or access denied');
  }

  // Soft delete by setting status to archived
  await db.prepare(`UPDATE clients SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?`).bind('archived', new Date().toISOString(), clientId, userId).run();

  return true;
}

/**
 * Search clients by company name
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} Matching clients
 */
export async function searchClients(db, userId, searchQuery) {
  const result = await db.prepare(`SELECT id, company_name, contact_email, status, created_at FROM clients WHERE user_id = ? AND status != 'archived' AND company_name LIKE ? ORDER BY company_name ASC LIMIT 50`).bind(userId, `%${searchQuery}%`).all();

  return result.results;
}
// Handles creating and managing clients for fractional CFOs

import { getUserPlan, checkUsageLimit } from './../auth/permissions.js';
import { verifyJWT } from './auth-helpers.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Extract and verify the authentication token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    const tokenPayload = await verifyJWT(token, env.JWT_SECRET);
    
    if (!tokenPayload) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userId = tokenPayload.userId;
    
    // Handle client creation
    if (url.pathname === '/clients' && request.method === 'POST') {
      try {
        // First, check what plan the user is on
        const userPlan = await getUserPlan(env.DB, userId);
        
        if (!userPlan) {
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Check if their plan allows client creation at all
        // This is the key restriction that makes client portal enterprise-only
        const clientLimit = await checkUsageLimit(env.DB, userId, userPlan.planType, 'maxClients');
        
        if (!clientLimit.allowed) {
          // User doesn't have access to client portal
          return new Response(JSON.stringify({
            error: 'Client portal is only available on Enterprise plan',
            currentPlan: userPlan.planType,
            upgradeRequired: 'enterprise',
            feature: 'client_portal'
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // If we get here, the user has permission to create clients
        const { company_name, contact_email, contact_phone } = await request.json();
        
        if (!company_name) {
          return new Response(JSON.stringify({ error: 'Company name is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Create the client
        const result = await env.DB.prepare(
          'INSERT INTO clients (user_id, company_name, contact_email, contact_phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          userId,
          company_name,
          contact_email,
          contact_phone,
          'active',
          new Date().toISOString()
        ).run();
        
        return new Response(JSON.stringify({
          success: true,
          client: {
            id: result.meta.last_row_id,
            company_name,
            contact_email,
            contact_phone,
            status: 'active'
          }
        }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle listing clients
    if (url.pathname === '/clients' && request.method === 'GET') {
      try {
        const userPlan = await getUserPlan(env.DB, userId);
        
        // Even viewing clients requires enterprise plan
        if (userPlan.planType !== 'enterprise') {
          return new Response(JSON.stringify({
            error: 'Client portal access requires Enterprise plan',
            currentPlan: userPlan.planType
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Fetch all clients for this user
        const clients = await env.DB.prepare(
          'SELECT id, company_name, contact_email, contact_phone, status, created_at FROM clients WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(userId).all();
        
        return new Response(JSON.stringify({
          success: true,
          clients: clients.results
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }

