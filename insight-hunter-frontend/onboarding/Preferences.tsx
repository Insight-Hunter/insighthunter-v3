import React, { useState, useEffect } from 'react';

const Preferences = () => {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [reportFrequency, setReportFrequency] = useState('weekly');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setAlertsEnabled(data.preferences.alertsEnabled);
      setReportFrequency(data.preferences.reportFrequency);
    })();
  }, []);

  const savePreferences = async () => {
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertsEnabled, reportFrequency }),
    });
    alert('Preferences saved');
  };

  return (
    <div>
      <h2>Preferences & Notifications</h2>
      <label>
        <input type="checkbox" checked={alertsEnabled} onChange={e => setAlertsEnabled(e.target.checked)} />
        Enable Alerts
      </label>
      <div>
        <label>Report Frequency:</label>
        <select value={reportFrequency} onChange={e => setReportFrequency(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <button onClick={savePreferences}>Save Preferences</button>
    </div>
  );
};

export default Preferences;
