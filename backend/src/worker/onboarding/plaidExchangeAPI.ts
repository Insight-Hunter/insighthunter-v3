import { Env } from “../../types/env”;
import { getUserId } from "../auth”;

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { publicToken } = await request.json();
  if (!publicToken) return new Response(JSON.stringify({ error: 'Missing public token' }), { status: 400 });

  try {
    const response = await fetch(`https://${env.PLAID_ENV}.plaid.com/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.PLAID_CLIENT_ID,
        secret: env.PLAID_SECRET,
        public_token: publicToken,
      }),
    });

    const data = await response.json();

    if (data.error) return new Response(JSON.stringify({ error: data.error }), { status: 500 });

    await env.ONBOARDING_KV.put(`${userId}:plaidAccessToken`, data.access_token);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 });
  }
}
