import React, { useState } from 'react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const BusinessSetup: React.FC<Props> = ({ onNext, onBack }) => {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!companyName.trim() || !industry.trim()) {
      setError('Please enter your company name and industry.');
      return;
    }
    setError('');
    try {
      const response = await fetch('/api/onboarding/business-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, industry }),
      });
      if (!response.ok) throw new Error('Failed to save business setup');
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Business Setup</h2>
      <div style={{ margin: '1rem 0' }}>
        <label>Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter your company name"
          style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
        />
      </div>
      <div style={{ margin: '1rem 0' }}>
        <label>Industry</label>
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="Enter your industry"
          style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onBack} style={{ marginRight: '1rem' }}>Back</button>
      <button onClick={handleSubmit}>Next</button>
    </div>
  );
};

export default BusinessSetup;
