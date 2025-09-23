import React, { useState } from 'react';
import './BusinessSetup.css';

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
      setError('Fill out all fields.');
      return;
    }
    // Call backend API to save business info if needed
    onComplete(businessName, industry);
  };

  return (
    <div className="business-setup-container">
      <h2>Set up Your Business</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Business Name"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Industry"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          required
        />
        {error && <p className="business-error">{error}</p>}
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default BusinessSetup;
