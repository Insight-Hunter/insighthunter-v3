// workers/analytics/auth.js
// Authentication utilities for verifying JWT tokens

/**

- Verify a JWT token and return the payload if valid
- @param {string} token - The JWT token to verify
- @param {string} secret - The secret key used to sign the token
- @returns {Promise<Object|null>} The token payload if valid, null otherwise
  */
  export async function verifyJWT(token, secret) {  try {
  // Split the JWT into its three parts
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  
  if (!headerB64 || !payloadB64 || !signatureB64) {
  return null;
  }
  
  // Verify the signature
  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  
  const secretKey = await crypto.subtle.importKey(
  "raw",
  encoder.encode(secret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["verify"]
  );
  
  // Decode the signature from base64url
  const signatureBytes = Uint8Array.from(
  atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
  c => c.charCodeAt(0)
  );
  
  const isValid = await crypto.subtle.verify(
  "HMAC",
  secretKey,
  signatureBytes,
  data
  );
  
  if (!isValid) {
  return null;
  }
  
  // Decode and parse the payload
  const payload = JSON.parse(
  atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
  );
  
  // Check if the token has expired
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
  return null;
  }
  
  return payload;

} catch (error) {
console.error("JWT verification error:", error);
return null;
}
}

/**

- Extract and verify the JWT from an Authorization header
- @param {Request} request - The incoming request
- @param {string} secret - The JWT secret
- @returns {Promise<Object|null>} The verified payload or null
  */
  export async function authenticateRequest(request, secret) {
  const authHeader = request.headers.get("Authorization");

if (!authHeader || !authHeader.startsWith("Bearer ")) {
return null;
}

const token = authHeader.substring(7);
return await verifyJWT(token, secret);
}
