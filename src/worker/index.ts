import { insight-hunter-v2 } from '@cloudflare/d1';
import { json } from '@cloudflare/workers-types'; // adjust import if needed
import bcrypt from 'bcryptjs'; // You'll need to bundle bcryptjs for Worker env
import jwt from '@tsndr/cloudflare-worker-jwt'; // A lightweight JWT library for workers

interface Env {
  USERS_DB: D1Database;
}

const JWT_SECRET = 'env.JWT_SECRET';

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/auth/signup') {
      const { email, password } = await request.json();

      if (!email || !password) return new Response('Missing fields', { status: 400 });

      // Check if user exists
      const existing = await env.USERS_DB.prepare('SELECT id FROM users WHERE email = ?')
        .bind(email)
        .first();

      if (existing) {
        return new Response(JSON.stringify({ message: 'User already exists' }), { status: 409 });
      }

      const hash = bcrypt.hashSync(password, 10);

      await env.USERS_DB
        .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
        .bind(email, hash)
        .run();

      const token = await jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

      return new Response(JSON.stringify({ token }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/signin') {
      const { email, password } = await request.json();

      if (!email || !password) return new Response('Missing fields', { status: 400 });

      const user = await env.USERS_DB.prepare('SELECT password_hash FROM users WHERE email = ?')
        .bind(email)
        .first();

      if (!user) return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });

      const valid = bcrypt.compareSync(password, user.password_hash);

      if (!valid) return new Response(JSON.stringify({ message: 'Invalid password' }), { status: 401 });

      const token = await jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

      return new Response(JSON.stringify({ token }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/business') {
      // Authenticate
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) return new Response('Unauthorized', { status: 401 });

      const token = authHeader.split(' ')[1];
      if (!token) return new Response('Unauthorized', { status: 401 });

      const verified = await jwt.verify(token, JWT_SECRET);
      if (!verified) return new Response('Forbidden', { status: 403 });

      const { email } = verified.payload as { email: string };

      const body = await request.json();
      const { businessName, industry } = body;

      if (!businessName || !industry) return new Response('Missing business info', { status: 400 });

      await env.USERS_DB
        .prepare('UPDATE users SET business_name = ?, industry = ? WHERE email = ?')
        .bind(businessName, industry, email)
        .run();

      return new Response(JSON.stringify({ message: 'Business info saved' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/business') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader) return new Response('Unauthorized', { status: 401 });

      const token = authHeader.split(' ')[1];
      if (!token) return new Response('Unauthorized', { status: 401 });

      const verified = await jwt.verify(token, JWT_SECRET);
      if (!verified) return new Response('Forbidden', { status: 403 });

      const { email } = verified.payload as { email: string };

      const user = await env.USERS_DB
        .prepare('SELECT business_name, industry FROM users WHERE email = ?')
        .bind(email)
        .first();

      if (!user) return new Response('User not found', { status: 404 });

      return new Response(JSON.stringify({ businessName: user.business_name, industry: user.industry }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
