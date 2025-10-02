import React, { useState } from 'react';

const AccountConnection: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [accountType, setAccountType] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setError('');
    setLoading(true);
    try { 
      if (accountType === 'quickbooks') {
        const handleQuickBooksOAuth = async () => {
          try {
            const res = await fetch('/api/onboarding/quickbooks-auth-link', {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
              });
      
              if (!res.ok) throw new Error('Failed to get QuickBooks auth URL');
              const data = await res.json();
              window.location.href = data.authUrl;
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Unknown OAuth error');
            }
      };

        
        window.location.href = '/api/onboarding/quickbooks-auth-link';
        return;
      }
      
      if (accountType === 'csv' && csvFile) {
        const formData = new FormData();
        formData.append('file', csvFile);
        const res = await fetch('/api/onboarding/upload-csv', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // adjust as needed
          }
        });
        if (!res.ok) throw new Error('CSV upload failed');
        onNext();
        return;
      }
      
      // Default: account type + details string API call
      if (!accountType || !accountDetails) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      const res = await fetch('/api/onboarding/connect-account', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 
        },
        body: JSON.stringify({ accountType, accountDetails }),
      });
      if (!res.ok) throw new Error('Account connection failed');
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
    setLoading(false);
  };


  return (
    <div style={{ padding: '2rem' }}>
      <h2>Connect your Financial Accounts</h2>
      <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
        <option value="">Select Account Type</option>
        <option value="bank">Bank Account</option>
        <option value="quickbooks">QuickBooks</option>
        <option value="stripe">Stripe</option>
        <option value="csv">CSV Upload</option>
      </select>
      {accountType === 'csv' ? (
        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)} />
      ) : (
        <input
          type="text"
          placeholder="Account details or API key"
          value={accountDetails}
          onChange={(e) => setAccountDetails(e.target.value)}
          style={{ display: 'block', marginTop: '1rem', width: '100%' }}
        />
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onBack} style={{ marginRight: '1rem' }}>Back</button>
      <button disabled={loading} onClick={handleConnect}>
        {loading ? 'Processing...' : 'Connect'}
      </button>
    </div>
  );
};

export default AccountConnection;

export async function analyzeFinancialData(records: Array<Record<string, string>>): Promise<any> {
  // Placeholder - integrate your AI or ML processing here

  // Example: Return a simple summary
  return {
    totalRecords: records.length,
    insights: 'Financial analysis coming soon.'
  };
}
