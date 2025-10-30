// workers/auth/jwt.js
// JSON Web Token generation and verification

/**
 * Generate a JWT token
 * @param {number} userId - User ID to include in token
 * @param {string} email - User email to include in token
 * @param {string} secret - Secret key for signing
 * @param {number} expiresIn - Expiration time in seconds (default 7 days)
 * @returns {Promise<string>} JWT token
 */
export async function generateJWT(userId, email, secret, expiresIn = 604800) {
  // JWT header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId: userId,
    email: email,
    iat: now,
    exp: now + expiresIn,
  };

  // Encode header and payload as base64url
  const encoder = new TextEncoder();
  const headerBase64 = base64urlEncode(JSON.stringify(header));
  const payloadBase64 = base64urlEncode(JSON.stringify(payload));

  // Create signature
  const data = encoder.encode(`${headerBase64}.${payloadBase64}`);
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', secretKey, data);
  const signatureBase64 = base64urlEncode(signature);

  // Combine all parts
  return `${headerBase64}.${payloadBase64}.${signatureBase64}`;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Promise<Object|null>} Decoded payload if valid, null otherwise
 */
export async function verifyJWT(token, secret) {
  try {
    // Split token into parts
    const [headerB64, payloadB64, signatureB64] = token.split('.');

    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }

    // Verify signature
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64urlDecode(signatureB64);
    const isValid = await crypto.subtle.verify('HMAC', secretKey, signatureBytes, data);

    if (!isValid) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(base64urlDecodeToString(payloadB64));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;

  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Base64url encode (without padding)
 * @param {string|ArrayBuffer} input - Data to encode
 * @returns {string} Base64url encoded string
 */
function base64urlEncode(input) {
  let str;
  if (typeof input === 'string') {
    str = btoa(input);
  } else {
    const bytes = new Uint8Array(input);
    str = btoa(String.fromCharCode(...bytes));
  }

  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64url decode to Uint8Array
 * @param {string} input - Base64url encoded string
 * @returns {Uint8Array} Decoded bytes
 */
function base64urlDecode(input) {
  // Convert base64url to base64
  let base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }

  // Decode to bytes
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Base64url decode to string
 * @param {string} input - Base64url encoded string
 * @returns {string} Decoded string
 */
function base64urlDecodeToString(input) {
  // Convert base64url to base64
  let base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }

  return atob(base64);
}
