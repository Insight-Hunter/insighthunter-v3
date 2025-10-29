const API = "http://localhost:4000/api/onboarding";

export async function savePersonalInfo( any) {
  const res = await fetch(`${API}/personal-info`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  });
  return res.json();
}

export async function saveBusinessSetup( any) {
  const res = await fetch(`${API}/business-setup`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  });
  return res.json();
}

export async function uploadCsv(csvFile: File) {
  const formData = new FormData();
  formData.append("csvFile", csvFile);
  const res = await fetch(`${API}/csv-upload`, { method: "POST", body: formData });
  return res.json();
}

export async function connectPlaid(payload: { userId: string; plaidToken: string }) {
  const res = await fetch(`${API}/plaid-connect`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  return res.json();
}

export async function connectThirdParty(payload: { userId: string; tokens: any }) {
  const res = await fetch(`${API}/third-party-connect`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  return res.json();
}

export async function saveInvoiceSettings(payload: { userId: string; invoiceSettings: any }) {
  const res = await fetch(`${API}/invoice-setup`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  return res.json();
}

export async function finalizeOnboarding(payload: { userId: string }) {
  const res = await fetch(`${API}/finalize`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  });
  return res.json();
}
