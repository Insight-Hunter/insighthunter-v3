import { getUserId } from '../auth';
import type { Env } from '../../types/env';

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  // Generate the OAuth URL for QuickBooks (example URL, replace with your OAuth logic)
  const redirectUri = 'https://yourapp.com/api/onboarding/quickbooks-callback';
  const clientId = env.QUICKBOOKS_CLIENT_ID;

  // Construct OAuth URL
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${encodeURIComponent(redirectUri)}&state=${userId}`;

  return new Response(JSON.stringify({ authUrl }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
