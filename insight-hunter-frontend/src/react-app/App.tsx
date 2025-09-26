import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import './App.css';
import AuthForm from '../components/AuthForm';
import BusinessSetup from '../components/BusinessSetup';
import OnboardingWelcome from '../components/OnboardingWelcome';
import RevenueExpensesChart from '../components/RevenueExpensesChart';
import CashFlowChart from '../components/CashFlowChart';
import ProfitMarginChart from "../components/ProfitMarginChart";
import { saveBusinessInfo } from '../apiClient';

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const financialData = [ /* your data unchanged */ ];
const kpis = { /* your KPIs unchanged */ };
const alerts = [ /* your alerts unchanged */ ];
const customers = [ /* your customers unchanged */ ];

const formatCurrency = (val: number) =>
  "$" + val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const priorityColors: Record<"high" | "medium" | "low", string> = {
  high: '#c0152f',
  medium: '#e69361',
  low: '#229556'
};

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<{ name: string; industry: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [step, setStep] = useState<'auth' | 'business' | 'onboarding' | 'dashboard'>('auth');

  // On successful login/auth
  const handleAuthSuccess = (email: string) => {
    setUserEmail(email);
    // Check if business info is saved locally or backend
    const onboarded = localStorage.getItem('insightHunterOnboarded');
    if (!onboarded) {
      setStep('business');
    } else {
      setStep('dashboard');
    }
  };

  const handleBusinessSubmit = async (businessName: string, industry: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      await saveBusinessInfo(token, businessName, industry);
      setBusinessInfo({ name: businessName, industry });
      setStep('onboarding');
    } catch (err) {
      alert('Error saving business info');
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('insightHunterOnboarded', 'true');
    setShowOnboarding(false);
    setStep('dashboard');
  };

  // Show onboarding modal/overlay or page if required
  useEffect(() => {
    if (step === 'onboarding') {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [step]);

  if (step === 'auth') {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (step === 'business') {
    return <BusinessSetup onSubmit={handleBusinessSubmit} />;
  }

  if (showOnboarding) {
    return <OnboardingWelcome onComplete={completeOnboarding} />;
  }

  // Prepare chart data arrays unchanged

  return (
    <div className="app">
      <div>Welcome, {userEmail}! Your business: {businessInfo?.name} ({businessInfo?.industry})</div>
      <header className="header">
        {/* Header and Nav Tabs same as before */}
      </header>
      <div className="main-container">
        <aside className="sidebar">
          {/* Sidebar content unchanged */}
        </aside>
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <>
              {/* KPI cards, charts, customers table unchanged */}
            </>
          )}
          {/* Other tabs unchanged */}
        </main>
      </div>
    </div>
  );
}

export default App;
