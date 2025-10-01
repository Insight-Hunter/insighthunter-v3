import React, { useState } from 'react';
import './BusinessSetup.css';

interface BusinessSetupProps {
  onSubmit: (businessName: string, industry: string) => void;
}

const BusinessSetup: React.FC<BusinessSetupProps> = ({ onSubmit }) => {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!businessName.trim() || !industry.trim()) {
      setError('Please enter both business name and industry.');
      return;
    }
    onSubmit(businessName.trim(), industry.trim());
  };

  return (
    <div className="business-setup-container">
      <h2>Set Up Your Business</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="businessName">Business Name</label>
        <input
          id="businessName"
          type="text"
          placeholder="Enter business name"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          required
        />
        <label htmlFor="industry">Industry</label>
        <input
          id="industry"
          type="text"
          placeholder="Enter industry"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Save Business Info</button>
      </form>
    </div>
  );
};

export default BusinessSetup;
