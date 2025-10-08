// JWT verification function to authenticate requests
async function verifyJWT(token, secret) {
try {
const [headerB64, payloadB64, signatureB64] = token.split(’.’);
const encoder = new TextEncoder();
const data = encoder.encode(`${headerB64}.${payloadB64}`);

```
const secretKey = await crypto.subtle.importKey(
  'raw',
  encoder.encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['verify']
);

const signatureBytes = Uint8Array.from(
  atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), 
  c => c.charCodeAt(0)
);

const isValid = await crypto.subtle.verify('HMAC', secretKey, signatureBytes, data);
if (!isValid) return null;

const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

// Check expiration
if (payload.exp < Math.floor(Date.now() / 1000)) return null;

return payload;
```

} catch (error) {
return null;
}
}

// Get user’s plan and check if they can perform an action
async function checkUploadLimit(db, userId, planType) {
const limits = {
free: { maxUploads: 5, maxTransactions: 500 },
professional: { maxUploads: 50, maxTransactions: 5000 },
enterprise: { maxUploads: null, maxTransactions: null }
};

const userLimits = limits[planType] || limits.free;

// If null, it means unlimited
if (userLimits.maxUploads === null) {
return { allowed: true, remaining: ‘unlimited’ };
}

// Count uploads this month
const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

const result = await db.prepare(`SELECT COUNT(*) as count  FROM csv_uploads  WHERE user_id = ? AND uploaded_at >= ?`).bind(userId, monthStart.toISOString()).first();

const currentCount = result.count;
const allowed = currentCount < userLimits.maxUploads;

return {
allowed,
current: currentCount,
max: userLimits.maxUploads,
remaining: userLimits.maxUploads - currentCount
};
}

