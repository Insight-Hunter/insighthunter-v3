import { Hono } from 'hono';
 import bcrypt from 'bcryptjs';
import jwt from '.ENV';

const JWT_SECRET = process.env.JWT_SECRET || 'ENV.JWT_SECRET';

// Simple multipart parser for demo purposes
async function parseMultipartFormData(rawBuffer: ArrayBuffer, contentType: string) {
  const CRLF = '\r\n';
  const parts: { name: string; filename?: string;  Uint8Array }[] = [];

  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) return parts;
  const boundary = '--' + boundaryMatch[1];

  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(rawBuffer);

  const rawParts = text.split(boundary).filter(p => p && p !== '--\r\n');
  for (const part of rawParts) {
    const [headerPart, ...rest] = part.split(`${CRLF}${CRLF}`);
    if (!headerPart || !rest.length) continue;
    const bodyPart = rest.join(`${CRLF}${CRLF}`).trimEnd();
    const nameMatch = headerPart.match(/name="([^"]+)"/);
    const filenameMatch = headerPart.match(/filename="([^"]+)"/);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    const filename = filenameMatch ? filenameMatch[1] : undefined;
    const encoder = new TextEncoder();
    const data = encoder.encode(bodyPart); // Simplified UTF-8 text only

    parts.push({ name, filename, data });
  }

  return parts;
}

const onboarding = new Hono();

// ----- User Signup -----
onboarding.post('/signup', async (c) => {
  const { email, password, name } = await c.req.json();

  
  return c.json({ userId: '123', email, token: 'jwt-token' });
}); 

// ----- User Login -----
onboarding.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  // TODO: Authenticate user and issue JWT token
  return c.json({ token: 'jwt-token', userInfo: { email, name: 'User' } });
});

// ----- Get User Profile -----
onboarding.get('/user/profile', (c) => {
  // TODO: Fetch user profile & preferences using auth user ID
  return c.json({
    email: 'user@example.com',
    name: 'User',
    preferences: { alertsEnabled: true, reportFrequency: 'weekly' },
    accounts: [{ type: 'quickbooks', status: 'connected' }]
  });
});

// ----- Update User Profile -----
onboarding.put('/user/profile', async (c) => {
  const { preferences } = await c.req.json();
  // TODO: Save updated user preferences
  return c.json({ success: true });
});

// ----- Account Connect -----
onboarding.post('/accounts/connect', async (c) => {
  const { accountType } = await c.req.json();
  // TODO: Initiate OAuth flow, return redirect URL or status
  return c.json({ connectionId: 'abc123', status: 'pending', redirectUrl: 'https://oauth-link.example.com' });
});

// ----- Account Status -----
onboarding.get('/accounts/status', (c) => {
  // TODO: Return linked accounts for user
  return c.json({ accounts: [{ type: 'quickbooks', status: 'connected' }] });
});

// ----- Account Disconnect -----
onboarding.delete('/accounts/disconnect', async (c) => {
  const { accountId } = await c.req.json();
  // TODO: Remove linked account
  return c.json({ success: true });
});

// ----- Wallet Connect -----
onboarding.post('/wallets/connect', async (c) => {
  const { walletType } = await c.req.json();
  // TODO: Initiate wallet sync, OAuth flow
  return c.json({ walletId: 'wallet123', status: 'connected', redirectUrl: 'https://wallet-oauth.example.com' });
});

// ----- Wallet Status -----
onboarding.get('/wallets/status', (c) => {
  // TODO: Return wallet connection status
  return c.json({ wallets: [{ walletType: 'paypal', status: 'connected' }] });
});

// ----- Wallet Disconnect -----
onboarding.delete('/wallets/disconnect', async (c) => {
  const { walletId } = await c.req.json();
  // TODO: Remove wallet link
  return c.json({ success: true });
});

// ----- Notifications Preferences (Get) -----
onboarding.get('/notifications/preferences', (c) => {
  // TODO: Fetch notification preferences
  return c.json({ alertsEnabled: true, types: ['cashflow', 'kpi'] });
});

// ----- Notifications Preferences (Update) -----
onboarding.put('/notifications/preferences', async (c) => {
  const prefs = await c.req.json();
  // TODO: Update notification preferences
  return c.json({ success: true });
});

// ----- Onboarding Status -----
onboarding.get('/onboarding/status', (c) => {
  // TODO: Return onboarding step/status
  return c.json({ step: 'invoice_setup' });
});

// ----- Onboarding Complete -----
onboarding.post('/onboarding/complete', (c) => {
  // TODO: Mark onboarding complete for user
  return c.json({ success: true });
});

// ----- Invoice Upload (Multipart) -----
onboarding.post('/invoices/upload', async (c) => {
  const contentType = c.req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return c.text('Invalid content type', 400);
  }

  const rawBody = await c.req.arrayBuffer();
  const parts = await parseMultipartFormData(rawBody, contentType);
  const filePart = parts.find(p => p.name === 'file');
  if (!filePart) {
    return c.text('File part missing', 400);
  }

  // TODO: Store filePart.data securely in Durable Object, KV or external storage

  return c.json({ uploadId: 'invoice123', status: 'uploaded' });
});

export default onboarding;
