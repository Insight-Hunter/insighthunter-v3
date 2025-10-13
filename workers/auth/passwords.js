// workers/auth/password.js
// Password hashing and verification using Web Crypto API

/**

- Hash a password using PBKDF2
- @param {string} password - Plain text password
- @returns {Promise<string>} Salt and hash combined as base64
  */
  export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

// Import password as cryptographic key
const key = await crypto.subtle.importKey(
‘raw’,
data,
{ name: ‘PBKDF2’ },
false,
[‘deriveBits’]
);

// Generate random salt
const salt = crypto.getRandomValues(new Uint8Array(16));

// Derive hash using PBKDF2 with 100,000 iterations
const hashBuffer = await crypto.subtle.deriveBits(
{
name: ‘PBKDF2’,
salt: salt,
iterations: 100000,
hash: ‘SHA-256’
},
key,
256
);

// Convert to base64 for storage
const hashArray = Array.from(new Uint8Array(hashBuffer));
const saltArray = Array.from(salt);

const hashBase64 = btoa(String.fromCharCode(…hashArray));
const saltBase64 = btoa(String.fromCharCode(…saltArray));

// Return salt and hash separated by colon
return `${saltBase64}:${hashBase64}`;
}

/**

- Verify a password against a stored hash
- @param {string} password - Plain text password to verify
- @param {string} storedHash - Stored hash from database
- @returns {Promise<boolean>} True if password matches
  */
  export async function verifyPassword(password, storedHash) {
  try {
  // Split stored hash into salt and hash components
  const [saltBase64, hashBase64] = storedHash.split(’:’);
  
  if (!saltBase64 || !hashBase64) {
  return false;
  }
  
  // Convert base64 back to byte arrays
  const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
  
  // Hash the provided password with the same salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
  ‘raw’,
  data,
  { name: ‘PBKDF2’ },
  false,
  [‘deriveBits’]
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
  {
  name: ‘PBKDF2’,
  salt: salt,
  iterations: 100000,
  hash: ‘SHA-256’
  },
  key,
  256
  );
  
  // Convert computed hash to base64
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHashBase64 = btoa(String.fromCharCode(…hashArray));
  
  // Compare hashes
  return computedHashBase64 === hashBase64;

} catch (error) {
console.error(‘Password verification error:’, error);
return false;
}
}
