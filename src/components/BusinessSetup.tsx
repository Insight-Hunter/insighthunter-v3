import React, { useState } from 'react';

interface BusinessSetupProps {
  onComplete: (businessName: string, industry: string) => void;
}

const BusinessSetup: React.FC<BusinessSetupProps> = ({ onComplete }) => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName || !industry) {
      setError('Please fill out all fields');
      return;
    }

    // TODO: Save business info to backend or global app state

    onComplete(businessName, industry);
  };

  return (
    <div className="business-setup-container">
      <h2>Set up Your Business</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
        <input type="text" placeholder="Industry" value={industry} onChange={e => setIndustry(e.target.value)} required />
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default BusinessSetup;
