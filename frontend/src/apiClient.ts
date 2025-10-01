const API_BASE = '/api';

const getAuthToken = () => localStorage.getItem('authToken') || '';

async function apiPost(path: string,  any, isMultipart = false) {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  let body: BodyInit;

  if (isMultipart && data instanceof FormData) {
    body = data;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`
    },
    body
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'API request failed');
  }
  return res.json();
}

export async function connectAccount(accountType: string) {
  return apiPost('/accounts/connect', { accountType });
}

export async function uploadInvoiceFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return apiPost('/invoices/upload', formData, true);
}

export async function connectWallet(walletType: string) {
  return apiPost('/wallets/connect', { walletType });
}

export async function savePreferences(preferences: { alertsEnabled: boolean }) {
  return apiPost('/user/profile', { preferences });
}

export async function saveBusinessInfo(token: string, businessName: string, industry: string) {
  const res = await fetch(`${API_BASE}/business/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ businessName, industry })
  });
  if (!res.ok) throw new Error('Failed to save business info');
  return res.json();
}