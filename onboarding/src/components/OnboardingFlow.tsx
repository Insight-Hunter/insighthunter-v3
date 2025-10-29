import React, { useState } from "react";
import { savePersonalInfo, saveBusinessSetup, uploadCsv, connectPlaid, connectThirdParty, saveInvoiceSettings, finalizeOnboarding } from "../api/onboarding";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { BusinessSetupForm } from "./BusinessSetupForm";
import { AccountConnectionForm } from "./AccountConnectionForm";
import { ThirdPartyAccountsForm } from "./ThirdPartyAccountsForm";
import { InvoiceInsightsForm } from "./InvoiceInsightsForm";
import { useAuth } from "/workspaces/insighthunter-v3/frontend/src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function OnboardingFlow() {
  const { setOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({ name: "", email: "" });
  const [businessSetup, setBusinessSetup] = useState({ businessName: "" });
  const [accountConnection, setAccountConnection] = useState({
    connectionMethod: "csv",
    csvData: null,
    plaidToken: null,
  });
  const [thirdPartyTokens, setThirdPartyTokens] = useState({});
  const [invoiceSettings, setInvoiceSettings] = useState({ alertThreshold: 1000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      await savePersonalInfo(personalInfo);
      await saveBusinessSetup(businessSetup);
      if (accountConnection.connectionMethod === "csv" && accountConnection.csvData) {
        await uploadCsv(accountConnection.csvData);
      }
      if (accountConnection.connectionMethod === "plaid" && accountConnection.plaidToken) {
        await connectPlaid({ userId: "user1", plaidToken: accountConnection.plaidToken });
      }
      await connectThirdParty({ userId: "user1", tokens: thirdPartyTokens });
      await saveInvoiceSettings({ userId: "user1", invoiceSettings });
      await finalizeOnboarding({ userId: "user1" });
			setOnboardingComplete(true);
			navigate("/dashboard");
      alert("Onboarding Complete!");
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      {error && <div className="error-message">{error}</div>}

      {step === 1 && (
        <PersonalInfoForm onChange={setPersonalInfo} defaultValues={personalInfo} />
      )}
      {step === 2 && (
        <BusinessSetupForm onChange={setBusinessSetup} defaultValues={businessSetup} />
      )}
      {step === 3 && (
        <AccountConnectionForm onChange={setAccountConnection} defaultValues={accountConnection} />
      )}
      {step === 4 && (
        <ThirdPartyAccountsForm onChange={setThirdPartyTokens} defaultValues={thirdPartyTokens} />
      )}
      {step === 5 && (
        <InvoiceInsightsForm onChange={setInvoiceSettings} defaultValues={invoiceSettings} />
      )}

      <div className="navigation-buttons">
        {step > 1 && <button type="button" onClick={prev} disabled={loading}>Back</button>}
        {step < 5 && <button type="button" onClick={next} disabled={loading}>Next</button>}
        {step === 5 && (
          <button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}
