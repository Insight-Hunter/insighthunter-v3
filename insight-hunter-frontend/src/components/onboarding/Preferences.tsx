import React, { useState } from 'react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const Preferences: React.FC<Props> = ({ onNext, onBack }) => {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [reportFrequency, setReportFrequency] = useState('monthly');
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      const response = await fetch('/api/onboarding/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifyEmail, reportFrequency }),
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Preferences</h2>
      <label>
        <input
          type="checkbox"
          checked={notifyEmail}
          onChange={() => setNotifyEmail(!notifyEmail)}
        />
        Receive notifications via email
      </label>
      <div style={{ marginTop: '1rem' }}>
        <label>Report Frequency:</label>
        <select
          value={reportFrequency}
          onChange={(e) => setReportFrequency(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onBack} style={{ marginRight: '1rem' }}>Back</button>
      <button onClick={handleSave}>Next</button>
    </div>
  );
};

export default Preferences;
