export function jsonResponse(any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
export function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}
export function successResponse(any) {
    return jsonResponse(Object.assign({ success: true }, data), 200);
}
