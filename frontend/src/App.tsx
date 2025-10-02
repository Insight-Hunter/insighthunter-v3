import React, { useState } from 'react';
import OnboardingWelcome from './onboarding/OnboardingWelcome';
import BusinessSetup from './onboarding/BusinessSetup';
import AccountConnection from './onboarding/AccountConnection';
import WalletSync from './onboarding/WalletSync';
import InvoiceSetup from './onboarding/InvoiceSetup';
import Preferences from './onboarding/Preferences';
import Summary from './onboarding/Summary';

const App: React.FC = () => {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div>
      {step === 0 && <OnboardingWelcome onNext={next} />}
      {step === 1 && <BusinessSetup onNext={next} onBack={back} />}
      {step === 2 && <AccountConnection onNext={next} onBack={back} />}
      {step === 3 && <WalletSync onNext={next} onBack={back} />}
      {step === 4 && <InvoiceSetup onNext={next} onBack={back} />}
      {step === 5 && <Preferences onNext={next} onBack={back} />}
      {step === 6 && <Summary onBack={back} />}
    </div>
  );
};

export default App;
