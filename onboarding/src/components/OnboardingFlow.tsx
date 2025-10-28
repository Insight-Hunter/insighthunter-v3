import React, { useState } from "react";
import { PersonalInfoForm, PersonalInfo } from "./PersonalInfoForm";
import { BusinessSetupForm, BusinessSetup } from "./BusinessSetupForm";
import { AccountConnectionForm, AccountConnectionData } from "./AccountConnectionForm";
import { ThirdPartyAccountsForm, ThirdPartyTokens } from "./ThirdPartyAccountsForm";
import { InvoiceInsightsForm, InvoiceSettings } from "./InvoiceInsightsForm";

type OnboardingStep =
  | 1
  | 2
  | 3
  | 4
  | 5;

interface OnboardingData
  extends PersonalInfo,
    BusinessSetup,
    AccountConnectionData {
  thirdPartyTokens: ThirdPartyTokens;
  invoiceSettings: InvoiceSettings;
}

export function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ name: "", email: "" });
  const [businessSetup, setBusinessSetup] = useState<BusinessSetup>({ businessName: "" });
  const [accountConnection, setAccountConnection] = useState<AccountConnectionData>({
    connectionMethod: "csv",
    csvData: null,
    plaidToken: null,
  });
  const [thirdPartyTokens, setThirdPartyTokens] = useState<ThirdPartyTokens>({});
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({ alertThreshold: 1000 });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const next = () => {
    if (step < 5) setStep((s) => (s + 1) as OnboardingStep);
  };
  const prev = () => {
    if (step > 1) setStep((s) => (s - 1) as OnboardingStep);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const payload: OnboardingData = {
      ...personalInfo,
      ...businessSetup,
      ...accountConnection,
      thirdPartyTokens,
      invoiceSettings,
    };

    try {
      const response = await fetch("https://your-cloudflare-worker/workflows/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to start onboarding");
      const result = await response.json();
      console.log("Onboarding started:", result);
      // Redirect or update UI to success
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      {error && <div className="error-message">{error}</div>}

      {step === 1 && <PersonalInfoForm onChange={setPersonalInfo} defaultValues={personalInfo} />}
      {step === 2 && <BusinessSetupForm onChange={setBusinessSetup} defaultValues={businessSetup} />}
      {step === 3 && <AccountConnectionForm onChange={setAccountConnection} defaultValues={accountConnection} />}
      {step === 4 && <ThirdPartyAccountsForm onChange={setThirdPartyTokens} defaultValues={thirdPartyTokens} />}
      {step === 5 && <InvoiceInsightsForm onChange={setInvoiceSettings} defaultValues={invoiceSettings} />}

      <div className="navigation-buttons">
        {step > 1 && <button disabled={loading} onClick={prev}>Back</button>}
        {step < 5 && <button disabled={loading} onClick={next}>Next</button>}
        {step === 5 && (
          <button disabled={loading} onClick={handleSubmit}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}
