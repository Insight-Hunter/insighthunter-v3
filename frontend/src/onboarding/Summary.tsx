import React, { useEffect, useState } from 'react';

type SummaryData = {
  businessInfo: { companyName: string; industry: string } | null;
  accountConnections: Array<{ accountType: string; accountDetails: string }>;
  invoiceSetup: { invoicePrefix: string; dueDays: number } | null;
  walletSync: any;
  preferences: { notifyEmail: boolean; reportFrequency: string } | null;
};

const Summary: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/onboarding/summary');
        if (!res.ok) throw new Error('Failed to load summary');
        const data = await res.json();
        setSummary(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    })();
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!summary) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Summary</h2>
      <h3>Business Info</h3>
      <p>Company: {summary.businessInfo?.companyName || 'N/A'}</p>
      <p>Industry: {summary.businessInfo?.industry || 'N/A'}</p>

      <h3>Account Connections</h3>
      <ul>
        {summary.accountConnections.length ? summary.accountConnections.map((acc, i) => (
          <li key={i}>{acc.accountType}: {acc.accountDetails}</li>
        )) : <li>No accounts connected.</li>}
      </ul>

      <h3>Invoice Setup</h3>
      <p>Prefix: {summary.invoiceSetup?.invoicePrefix || 'N/A'}</p>
      <p>Due Days: {summary.invoiceSetup?.dueDays || 'N/A'}</p>

      <h3>Wallet Sync</h3>
      <pre>{JSON.stringify(summary.walletSync, null, 2)}</pre>

      <h3>Preferences</h3>
      <p>Email Notifications: {summary.preferences?.notifyEmail ? 'Yes' : 'No'}</p>
      <p>Report Frequency: {summary.preferences?.reportFrequency || 'N/A'}</p>

      <button onClick={onBack} style={{ marginTop: '1rem' }}>Back</button>
    </div>
  );
};

export default Summary;
