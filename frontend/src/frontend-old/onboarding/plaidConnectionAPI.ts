import { getUserId } from '../auth';
import { Env } from '../../types/env';

const PLAID_CLIENT_ID = 'env.PLAID_CLIENT_ID';
const PLAID_SECRET = 'env.PLAID_SECRET';
const PLAID_ENV = 'sandbox'; // or 'development', 'production'

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  try {
    const { publicToken } = await request.json();
    if (!publicToken) {
      return new Response(JSON.stringify({ error: 'Missing public token' }), { status: 400 });
    }

    // Exchange public token for access token by calling Plaid API
    const exchangeResponse = await fetch(`https://${PLAID_ENV}.plaid.com/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token: publicToken,
      }),
    });

    const exchangeData = await exchangeResponse.json();

    if (exchangeData.error) {
      return new Response(JSON.stringify({ error: exchangeData.error }), { status: 500 });
    }

    const accessToken = exchangeData.access_token;

    // Save accessToken securely in KV or other storage for the user
    await env.ONBOARDING_KV.put(`${userId}:plaidAccessToken`, accessToken);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500 });
  }
}
