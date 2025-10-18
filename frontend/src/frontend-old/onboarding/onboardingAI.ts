import { getUserId } from '../auth';
import type { Env } from '../../types/env';

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const AI_API_SECRET = env.WORKERS_AI_API_SECRET;
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  // Fetch onboarding data from KV storage
  const businessInfoRaw = await env.ONBOARDING_KV.get(`${userId}:businessSetup`);
  const accountConnectionsRaw = await env.ONBOARDING_KV.get(`${userId}:accountConnections`);
  const preferencesRaw = await env.ONBOARDING_KV.get(`${userId}:preferences`);

  const businessInfo = businessInfoRaw ? JSON.parse(businessInfoRaw) : {};
  const accountConnections = accountConnectionsRaw ? JSON.parse(accountConnectionsRaw) : [];
  const preferences = preferencesRaw ? JSON.parse(preferencesRaw) : {};

  // Compose prompt for AI
  const prompt = `
You are an expert CFO assistant. Based on the following onboarding details, generate a personalized welcome message and 3 actionable financial tips.

Business Info: ${JSON.stringify(businessInfo)}
Account Connections: ${JSON.stringify(accountConnections)}
Preferences: ${JSON.stringify(preferences)}
`;

  try {
    // Call Workers AI or OpenAI model
    const response = await fetch('https://api.cloudflare.com/worker-ai/generate-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_SECRET}`
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      return new Response('AI generation failed', { status: 500 });
    }

    const result = await response.json();
    const aiMessage = result.result || 'Welcome to Insight Hunter!';

    return new Response(JSON.stringify({ aiMessage }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
