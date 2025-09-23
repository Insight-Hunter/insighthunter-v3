export async function saveBusinessInfo(token: string|null, businessName: string, industry: string) {
  if (!token) throw new Error('Not signed in');
  const res = await fetch('/api/business', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ businessName, industry }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
