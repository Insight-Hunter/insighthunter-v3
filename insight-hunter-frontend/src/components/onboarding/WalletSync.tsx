import React, { useState } from 'react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const WalletSync: React.FC<Props> = ({ onNext, onBack }) => {
  const [walletType, setWalletType] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!walletType || !apiKey) {
      setError('Please select wallet type and provide API key.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/wallet-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletType, apiKey }),
      });
      if (!response.ok) throw new Error('Failed to sync wallet');
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Wallet Sync (Payment Processors)</h2>
      <select value={walletType} onChange={(e) => setWalletType(e.target.value)}>
        <option value="">Select Wallet Type</option>
        <option value="stripe">Stripe</option>
        <option value="paypal">PayPal</option>
      </select>
      <input
        type="text"
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{ display: 'block', width: '100%', marginTop: '1rem' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onBack} style={{ marginRight: '1rem' }}>Back</button>
      <button disabled={loading} onClick={handleConnect}>
        {loading ? 'Syncing...' : 'Sync'}
      </button>
    </div>
  );
};

export default WalletSync;
