import React, { useState } from 'react';

const Preferences: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [reportFrequency, setReportFrequency] = useState('monthly');
  const [error, setError] = useState('');

  const save = async () => {
    try {
      const res = await fetch('/api/onboarding/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifyEmail, reportFrequency }),
      });
      if (!res.ok) throw new Error('Save failed');
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Preferences</h2>
      <label>
        <input type="checkbox" checked={notifyEmail} onChange={() => setNotifyEmail(!notifyEmail)} />
        Receive notifications via email
      </label>
      <div style={{ marginTop: '1rem' }}>
        <label>Report Frequency:</label>
        <select value={reportFrequency} onChange={(e) => setReportFrequency(e.target.value)} style={{ marginLeft: '0.5rem' }}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onBack}>Back</button>
        <button onClick={save} style={{ marginLeft: '0.5rem' }}>Next</button>
      </div>
    </div>
  );
};

export default Preferences;
