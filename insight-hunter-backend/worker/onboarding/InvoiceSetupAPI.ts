export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    const { invoicePrefix, dueDays } = await request.json();

    if (!invoicePrefix || !dueDays) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    await env.ONBOARDING_KV.put('invoiceSetup', JSON.stringify({ invoicePrefix, dueDays }));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
