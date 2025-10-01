import { getUserId } from '../auth';
import { Env } from '../../types/env;

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const businessInfo = JSON.parse(await env.ONBOARDING_KV.get(`${userId}:businessSetup`) || '{}');
  const accountConnections = JSON.parse(await env.ONBOARDING_KV.get(`${userId}:accountConnections`) || '[]');
  const invoiceSetup = JSON.parse(await env.ONBOARDING_KV.get(`${userId}:invoiceSetup`) || '{}');
  const walletSync = JSON.parse(await env.ONBOARDING_KV.get(`${userId}:walletSync`) || '{}');
  const preferences = JSON.parse(await env.ONBOARDING_KV.get(`${userId}:preferences`) || '{}');

  return new Response(
    JSON.stringify({ businessInfo, accountConnections, invoiceSetup, walletSync, preferences }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
