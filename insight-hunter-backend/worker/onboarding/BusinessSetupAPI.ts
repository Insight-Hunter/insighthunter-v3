import type { Env, Request } from './env';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const { companyName, industry } = await request.json();

    if (!companyName || !industry) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await env.ONBOARDING_KV.put('businessSetup', JSON.stringify({ companyName, industry }));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
