import React from 'react';

interface Props {
  onNext: () => void;
}

const OnboardingWelcome: React.FC<Props> = ({ onNext }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Insight Hunter</h1>
      <p>Your AI-powered CFO assistant to help small businesses succeed with financial insights and management.</p>
      <button onClick={onNext} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
        Get Started
      </button>
    </div>
  );
};

export default OnboardingWelcome;
