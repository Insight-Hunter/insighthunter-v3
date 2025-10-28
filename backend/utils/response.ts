export function jsonResponse( any, status: number = 200): Response {
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

export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}

export function successResponse( any): Response {
  return jsonResponse({ success: true, ...data }, 200);
}
