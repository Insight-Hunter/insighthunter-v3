import React, { useState } from 'react';
import './OnboardingWelcome.css';

interface OnboardingWelcomeProps {
  onComplete: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onComplete }) => {
  const [stepsCompleted, setStepsCompleted] = useState({
    accounts: false,
    invoices: false,
    wallet: false,
  });

  const toggleStep = (step: keyof typeof stepsCompleted) => {
    setStepsCompleted(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const allStepsDone = Object.values(stepsCompleted).every(Boolean);

  return (
    <div className="onboarding-container">
      <h1>Welcome to Insight Hunter</h1>
      <p>Get started in a few simple steps</p>

      <div className="step-list">
        <label>
          <input type="checkbox" checked={stepsCompleted.accounts} onChange={() => toggleStep('accounts')} />
          Connect your accounts
        </label>

        <label>
          <input type="checkbox" checked={stepsCompleted.invoices} onChange={() => toggleStep('invoices')} />
          Set up invoice insights
        </label>

        <label>
          <input type="checkbox" checked={stepsCompleted.wallet} onChange={() => toggleStep('wallet')} />
          Enable wallet sync
        </label>
      </div>

      <button
        disabled={!allStepsDone}
        onClick={() => {
          localStorage.setItem('insightHunterOnboarded', 'true');
          onComplete();
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default OnboardingWelcome;
