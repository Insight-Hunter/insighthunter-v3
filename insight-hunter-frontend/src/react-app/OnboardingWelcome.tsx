
import React, { useState, ChangeEvent } from 'react';
import {
  connectAccount,
  uploadInvoiceFile,
  connectWallet,
  savePreferences
} from '../apiClient';

import React, {
    useState
} from 'react';


type Step = 'account' | 'invoice' | 'wallet' | 'preferences' | 'finish';

interface OnboardingWelcomeProps {
    onComplete: () => void;
}

const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const nextStep = () => {
    if (currentStep === 'finish') {
      onComplete();
    } else {
      setCurrentStep(prev => {
        switch(prev) {
          case 'account': return 'invoice';
          case 'invoice': return 'wallet';
          case 'wallet': return 'preferences';
          case 'preferences': return 'finish';
          default: return 'finish';
        }
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => {
      switch(prev) {
        case 'finish': return 'preferences';
        case 'preferences': return 'wallet';
        case 'wallet': return 'invoice';
        case 'invoice': return 'account';
        default: return 'account';
      }
    });
  };

  const handleAccountConnect = async (accountType: string) => {
    try {
      setLoading(true);
      const res = await connectAccount(accountType);
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        alert('Account connected or process initiated.');
        nextStep();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setInvoiceFile(e.target.files[0]);
    }
  };

  const handleInvoiceUpload = async () => {
    if (!invoiceFile) {
      alert('Please select a file first');
      return;
    }
    try {
      setLoading(true);
      await uploadInvoiceFile(invoiceFile);
      alert('Invoice uploaded successfully');
      nextStep();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      setLoading(true);
      const res = await connectWallet('paypal');
      alert('Wallet connected successfully.');
      nextStep();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setLoading(true);
      await savePreferences({ alertsEnabled });
      alert('Preferences saved.');
      nextStep();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 'account':
        return (
          <div>
            <h2>Connect Your Financial Account</h2>
            <button disabled={loading} onClick={() => handleAccountConnect('quickbooks')}>Connect QuickBooks</button>
            <button disabled={loading} onClick={() => handleAccountConnect('xero')}>Connect Xero</button>
          </div>
        );
      case 'invoice':
        return (
          <div>
            <h2>Upload Your Invoice Data</h2>
            <input type="file" accept=".csv,application/vnd.ms-excel" onChange={handleInvoiceFileChange} />
            <button disabled={loading} onClick={handleInvoiceUpload}>Upload</button>
          </div>
        );
      case 'wallet':
        return (
          <div>
            <h2>Sync Your Wallet</h2>
            <button disabled={loading} onClick={handleWalletConnect}>Connect PayPal Wallet</button>
          </div>
        );
      case 'preferences':
        return (
          <div>
            <h2>Set Your Preferences</h2>
            <label>
              <input type="checkbox" checked={alertsEnabled} onChange={e => setAlertsEnabled(e.target.checked)} />
              Enable KPI alerts
            </label>
            <br />
            <button disabled={loading} onClick={handlePreferencesSave}>Save Preferences</button>
          </div>
        );
      case 'finish':
        return (
          <div>
            <h2>All Done!</h2>
            <p>You have completed onboarding.</p>
            <button onClick={onComplete}>Go to Dashboard</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-welcome">
      {renderStep()}
      <div style={{ marginTop: '20px' }}>
        {currentStep !== 'account' && currentStep !== 'finish' && (
          <button onClick={prevStep} disabled={loading}>Back</button>
        )}
      </div>
    </div>
  );
=======
const OnboardingWelcome: React.FC < OnboardingWelcomeProps > = ({
    onComplete
}) => {
    const [currentStep,
        setCurrentStep] = useState < Step > ('account');

    const nextStep = () => {
        if (currentStep === 'finish') {
            onComplete();
        } else {
            setCurrentStep(prev => {
                switch (prev) {
                    case 'account': return 'invoice';
                    case 'invoice': return 'wallet';
                    case 'wallet': return 'preferences';
                    case 'preferences': return 'finish';
                    default: return 'finish';
                }
            });
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => {
            switch (prev) {
            case 'finish': return 'preferences';
            case 'preferences': return 'wallet';
            case 'wallet': return 'invoice';
            case 'invoice': return 'account';
            default: return 'account';
            }
        });
    };

    // Placeholder functions for form submission and API calls
    const connectAccount = () => {
        // Implement API linking account here
        alert('Account connected');
        nextStep();
    };

    const uploadInvoice = () => {
        // Implement upload logic here
        alert('Invoice uploaded');
        nextStep();
    };

    const connectWallet = () => {
        // Implement wallet connect here
        alert('Wallet connected');
        nextStep();
    };

    const savePreferences = () => {
        // Implement preferences saving here
        alert('Preferences saved');
        nextStep();
    };

    const renderStep = () => {
        switch (currentStep) {
        case 'account':
            return ( < div > < h2 > Connect Your Financial Account < /h2> < button onClick = {
                connectAccount
            } > Connect QuickBooks < /button> < button onClick = {
                connectAccount
            } > Connect Xero < /button> < /div>
            );
        case 'invoice':
            return ( < div > < h2 > Upload Your Invoice Data < /h2> < input type = "file" accept = ".csv,application/vnd.ms-excel" /> < button onClick = {
                uploadInvoice
            } > Upload < /button> < /div>
            );
        case 'wallet':
            return ( < div > < h2 > Sync Your Wallet < /h2> < button onClick = {
                connectWallet
            } > Connect PayPal Wallet < /button> < /div>
            );
        case 'preferences':
            return ( < div > < h2 > Set Your Preferences < /h2> < label > < input type = "checkbox" defaultChecked />
                Enable KPI alerts < /label> < br /> < button onClick = {
                    savePreferences
                } > Save Preferences < /button> < /div>
            );
        case 'finish':
            return ( < div > < h2 > All Done!</h2> < p > You have completed onboarding. < /p> < button onClick = {
                onComplete
            } > Go to Dashboard < /button> < /div>
            );
        default:
            return null;
        }
    };

    return ( < div className = "onboarding-welcome" >
        {
            renderStep()} < div style = {{
                marginTop: '20px'
            }} >
        {
            currentStep !== 'account' && currentStep !== 'finish' && ( < button onClick = {
                prevStep
            } > Back < /button>
            )} < /div> < /div>
    };
};

export default OnboardingWelcome;