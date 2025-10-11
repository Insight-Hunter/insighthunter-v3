import React from "react";
import AccountConnection from "./AccountConnection";
import BusinessSetup from "./BusinessSetup";
import InvoiceSetup from "./lnvoiceSetup";
import OnboardingWelcome from "./OnboardingWelcome";
import Preferences from "./Preferences";
import Summary from "./Summary";
import WalletSync from "./WalletSync";

const OnboardingFlow = () => {
  const [step, setStep] = React.useState(1);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  
  switch(step) {
    case 1: return <OnboardingWelcome onNext={nextStep} />;
    case 2: return <BusinessSetup onNext={nextStep} onBack={prevStep} />;
    case 3: return <AccountConnection onNext={nextStep} onBack={prevStep} />;
    case 4: return <InvoiceSetup onNext={nextStep} onBack={prevStep} />;
    case 5: return <WalletSync onNext={nextStep} onBack={prevStep} />;
    case 6: return <Preferences onNext={nextStep} onBack={prevStep} />;
    case 7: return <Summary onBack={prevStep} />;
    default: return null;
  }
};
export default OnboardingFlow;