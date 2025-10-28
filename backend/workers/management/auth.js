// workers/management/auth.js
// Authentication utilities (shared pattern across Workers)

/**

- Verify a JWT token and return the payload if valid
- @param {string} token - The JWT token to verify
- @param {string} secret - The secret key used to sign the token
- @returns {Promise<Object|null>} The token payload if valid, null otherwise
  */
  export async function verifyJWT(token, secret) {
  try {
  const [headerB64, payloadB64, signatureB64] = token.split(’.’);
  
  if (!headerB64 || !payloadB64 || !signatureB64) {
  return null;
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  
  const secretKey = await crypto.subtle.importKey(
  ‘raw’,
  encoder.encode(secret),
  { name: ‘HMAC’, hash: ‘SHA-256’ },
  false,
  [‘verify’]
  );
  
  const signatureBytes = Uint8Array.from(
  atob(signatureB64.replace(/-/
