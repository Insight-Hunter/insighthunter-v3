import { Env } from "../../types/env”;
import { getUserId } from “../auth”;

export async function onRequestGet({ env }: { env: Env }) {
  const userId = 'unique_user_id'; // Replace with real user ID logic
  try {
    const response = await fetch(`https://${env.PLAID_ENV}.plaid.com/link/token/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.PLAID_CLIENT_ID,
        secret: env.PLAID_SECRET,
        client_name: 'Insight Hunter',
        products: ['auth', 'transactions'],
        country_codes: ['US'],
        language: 'en',
        user: { client_user_id: userId },
      }),
    });

    const data = await response.json();
    if (data.error) return new Response(JSON.stringify({ error: data.error }), { status: 500 });

    return new Response(JSON.stringify({ link_token: data.link_token }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 });
  }
}
