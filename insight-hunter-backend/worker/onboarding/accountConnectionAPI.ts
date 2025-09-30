export async function onRequestPost({
    request, env
}: {
    request: Request; env: Env
}) {
    try {
        const {
            accountType,
            accountDetails
        } = await request.json();

        if (!accountType || !accountDetails) {
            return new Response(JSON.stringify({
                error: 'Missing fields'
            }), {
                status: 400
            });
        }

        let accounts = JSON.parse(await env.ONBOARDING_KV.get('accountConnections') || '[]');
        accounts.push({
            accountType, accountDetails
        });
        await env.ONBOARDING_KV.put('accountConnections', JSON.stringify(accounts));

        return new Response(JSON.stringify({
            success: true
        }), {
            status: 200
        });
    } catch (err) {
        return new Response(JSON.stringify({
            error: err.message
        }), {
            status: 500
        });
    }
}