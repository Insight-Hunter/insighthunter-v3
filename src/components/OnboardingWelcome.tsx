import React from 'react';
import './OnboardingWelcome.css';

const OnboardingWelcome: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
  <div className="onboarding-welcome-bg">
    <div className="onboarding-welcome-container">
      <div className="welcome-logo-row">
        <span className="logo-text">INSIGHT HUNTER</span>
      </div>
      <h1 className="welcome-title">Welcome to<br />Insight Hunter</h1>
      <div className="welcome-desc">Get started in a few simple steps</div>
      <div className="welcome-wallet-circle">
        {/* Replace with your SVG wallet icon */}
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="65" fill="#153A33" />
          <rect x="40" y="62" width="60" height="36" rx="15" fill="#0ED8B0" opacity="0.2"/>
          <rect x="44" y="66" width="52" height="28" rx="12" fill="#144D48" stroke="#1BDCB7" strokeWidth="2"/>
          <circle cx="90" cy="80" r="6" fill="#1BDCB7"/>
        </svg>
      </div>
      <div className="welcome-steps-list">
        <div className="welcome-step">
          <span className="welcome-step-check">&#10003;</span>
          Connect your accounts
        </div>
        <div className="welcome-step">
          <span className="welcome-step-check">&#10003;</span>
          Set up invoice insights
        </div>
        <div className="welcome-step">
          <span className="welcome-step-check">&#10003;</span>
          Enable wallet sync
        </div>
      </div>
      <button className="welcome-continue-btn" onClick={onComplete}>
        Continue
      </button>
    </div>
  </div>
);

export default OnboardingWelcome;
