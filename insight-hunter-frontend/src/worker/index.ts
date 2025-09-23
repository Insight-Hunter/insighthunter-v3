// src/worker/index.ts

import { Env } from './env';

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // Example API route to fetch KPIs
    if (url.pathname === '/api/kpis' && request.method === 'GET') {
      const result = await env.USERS_DB.prepare('SELECT * FROM kpis').all();
      return new Response(JSON.stringify(result.results), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Other API endpoints can be added here similarly

    return new Response('Not Found', { status: 404 });
  },
};
