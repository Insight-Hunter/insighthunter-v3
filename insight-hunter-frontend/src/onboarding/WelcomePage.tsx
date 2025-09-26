import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  const startOnboarding = () => {
    navigate('/connect-account');
  };

  return (
    <div>
      <h1>Welcome to Insight Hunter</h1>
      <p>Your AI-powered Auto-CFO solution for freelancers and small firms.</p>
      <button onClick={startOnboarding}>Get Started</button>
    </div>
  );
};

export default WelcomePage;
