import { Env } from "../../types/env";
import { getUserId } from "../auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { accountType, accountDetails } = await request.json();
  if (!accountType || !accountDetails) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }

  const stored = await env.ONBOARDING_KV.get(`${userId}:accountConnections`);
  const accounts = stored ? JSON.parse(stored) : [];
  accounts.push({ accountType, accountDetails, connectedAt: new Date().toISOString() });
  await env.ONBOARDING_KV.put(`${userId}:accountConnections`, JSON.stringify(accounts));

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
