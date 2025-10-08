 client-management-worker.js
// Handles creating and managing clients for fractional CFOs

import { getUserPlan, checkUsageLimit } from './permissions.js';
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
};
