export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const { walletType, apiKey } = await request.json();

    if (!walletType || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await env.ONBOARDING_KV.put('walletSync', JSON.stringify({ walletType, apiKey }));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
