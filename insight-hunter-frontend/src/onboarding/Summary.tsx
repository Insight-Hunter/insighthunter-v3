import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Summary = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setUserData(data);
    })();
  }, []);

  const finishOnboarding = async () => {
    await fetch('/api/onboarding/complete', { method: 'POST' });
    navigate('/dashboard');
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Onboarding Summary</h2>
      <p>Email: {userData.email}</p>
      <p>Connected Accounts: {userData.accounts?.length || 0}</p>
      <p>Preferences: {JSON.stringify(userData.preferences)}</p>
      <button onClick={finishOnboarding}>Finish and Go to Dashboard</button>
    </div>
  );
};

export default Summary;
