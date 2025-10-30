import { Env } from "../../types/env"
import { getUserId } from "../auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const userId = getUserId(request);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { companyName, industry } = await request.json();
  if (!companyName || !industry) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
  }
  await env.ONBOARDING_KV.put(`${userId}:businessSetup`, JSON.stringify({ companyName, industry }));
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
