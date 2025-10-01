import React, { useState } from 'react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const AccountConnection: React.FC<Props> = ({ onNext, onBack }) => {
  const [accountType, setAccountType] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!accountType || !accountDetails) {
      setError('Please select an account type and provide details.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/connect-account', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Example auth header
        },
        body: JSON.stringify({ accountType, accountDetails }),
      });
      if (!response.ok) throw new Error('Failed to connect account');
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
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
      </select>
      <input
        type="text"
        placeholder="Account details or API key"
        value={accountDetails}
        onChange={(e) => setAccountDetails(e.target.value)}
        style={{ display: 'block', width: '100%', marginTop: '1rem' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onBack} style={{ marginRight: '1rem' }}>Back</button>
      <button disabled={loading} onClick={handleConnect}>
        {loading ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
};

export default AccountConnection;
