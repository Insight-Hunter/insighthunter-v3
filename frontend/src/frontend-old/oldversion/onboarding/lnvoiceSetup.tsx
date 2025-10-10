import React, { useState } from 'react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const InvoiceSetup: React.FC<Props> = ({ onNext, onBack }) => {
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [dueDays, setDueDays] = useState(30);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!invoicePrefix) {
      setError('Invoice prefix is required.');
      return;
    }
    setError('');
    try {
      const response = await fetch('/api/onboarding/invoice-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoicePrefix, dueDays }),
      });
      if (!response.ok) throw new Error('Failed invoice setup save');
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Invoice Setup</h2>
      <input
        type="text"
        value={invoicePrefix}
        placeholder="Invoice Prefix"
        onChange={(e) => setInvoicePrefix(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
      />
      <label>Default Due Days</label>
      <input
        type="number"
        value={dueDays}
        onChange={(e) => setDueDays(Number(e.target.value))}
        min={1}
        max={365}
        style={{ display: 'block', width: '100%', marginBottom: '1rem' }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onBack} style={{ marginRight: '1rem' }}>Back</button>
      <button onClick={handleSubmit}>Next</button>
    </div>
  );
};

export default InvoiceSetup;
