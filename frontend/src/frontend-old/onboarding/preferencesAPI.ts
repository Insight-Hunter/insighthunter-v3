import { getUserId } from '../auth';
import { Env } from '../../types/env';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { notifyEmail, reportFrequency } = await request.json();

  await env.ONBOARDING_KV.put(`${userId}:preferences`, JSON.stringify({ notifyEmail, reportFrequency }));

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
