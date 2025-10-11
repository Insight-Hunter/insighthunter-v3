import React, { useState } from 'react';

const WalletSync: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [walletType, setWalletType] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const saveWallet = async () => {
    if (!walletType || !apiKey) {
      setError('Please select wallet type and enter API key');
      return;
    }
    setError('');

    try {
      const res = await fetch('/api/onboarding/wallet-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletType, apiKey }),
      });

      if (!res.ok) throw new Error('Save failed');

      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Wallet Sync</h2>
      <select value={walletType} onChange={(e) => setWalletType(e.target.value)}>
        <option value="">Select Wallet Type</option>
        <option value="metamask">MetaMask</option>
        <option value="walletconnect">WalletConnect</option>
      </select>
      <input
        placeholder="API Key or Wallet Address"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{ display: 'block', marginTop: '1rem', width: '100%' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onBack} style={{ marginRight: '1rem' }}>Back</button>
      <button onClick={saveWallet}>Next</button>
    </div>
  );
};

export default WalletSync;
