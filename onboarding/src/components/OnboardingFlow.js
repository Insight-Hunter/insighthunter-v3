var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const [error, setError] = useState(null);
    const next = () => setStep((s) => Math.min(s + 1, 6));
    const prev = () => setStep((s) => Math.max(s - 1, 1));
    const handleSubmit = () => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        try {
            yield savePersonalInfo(personalInfo);
            yield saveBusinessSetup(businessSetup);
            if (accountConnection.connectionMethod === "csv" && accountConnection.csvData) {
                yield uploadCsv(accountConnection.csvData);
            }
            if (accountConnection.connectionMethod === "plaid" && accountConnection.plaidToken) {
                yield connectPlaid({ userId: "user1", plaidToken: accountConnection.plaidToken });
            }
            yield connectThirdParty({ userId: "user1", tokens: thirdPartyTokens });
            yield saveInvoiceSettings({ userId: "user1", invoiceSettings });
            yield finalizeOnboarding({ userId: "user1" });
            setOnboardingComplete(true);
            navigate("/dashboard");
            alert("Onboarding Complete!");
        }
        catch (e) {
            setError(e.message || "Unknown error");
        }
        finally {
            setLoading(false);
        }
    });
    return (<div className="onboarding-container">
      {error && <div className="error-message">{error}</div>}

      {step === 1 && (<PersonalInfoForm onChange={setPersonalInfo} defaultValues={personalInfo}/>)}
      {step === 2 && (<BusinessSetupForm onChange={setBusinessSetup} defaultValues={businessSetup}/>)}
      {step === 3 && (<AccountConnectionForm onChange={setAccountConnection} defaultValues={accountConnection}/>)}
      {step === 4 && (<ThirdPartyAccountsForm onChange={setThirdPartyTokens} defaultValues={thirdPartyTokens}/>)}
      {step === 5 && (<InvoiceInsightsForm onChange={setInvoiceSettings} defaultValues={invoiceSettings}/>)}

      <div className="navigation-buttons">
        {step > 1 && <button type="button" onClick={prev} disabled={loading}>Back</button>}
        {step < 5 && <button type="button" onClick={next} disabled={loading}>Next</button>}
        {step === 5 && (<button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>)}
      </div>
    </div>);
}
