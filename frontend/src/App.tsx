import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { ClientProvider } from './contexts/ClientContext.tsx';
import { OnboardingFlow } from './../components/OnboardingFlow';
import { Dashboard } from "./components/Dashboard";

// Layout Components
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Main Pages
import DashboardPage from './pages/Dashboard/DashboardPage';
import ClientsPage from './pages/Clients/ClientPage';
import ClientDetail from './pages/Clients/ClientDetail';
import UploadPage from './pages/Upload/UploadPage';
import ReportsPage from './pages/Reports/ReportsPage';
import ReportDetail from './pages/Reports/ReportDetail';
import Forecasting from './pages/Analytics/ForecastPage';
import AlertsPage from './pages/Alerts/AlertsPage';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

// Client Portal
import ClientPortal from './pages/ClientPortal/ClientPortal';

// 404 Page
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ClientProvider>
          <AppRoutes />
        </ClientProvider>
      </AuthProvider>
    </Router>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading, onboardingComplete } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />}
        />
      </Route>

      {/* Client Portal (Semi-public) */}
      <Route path="/portal/:token" element={<ClientPortal />} />

      {/* Protected Routes */}
      <Route
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
      >
        {/* Redirect to onboarding if not complete */}
        {!onboardingComplete && <Route path="*" element={<Navigate to="/onboarding" replace />} />}
        
        {/* Onboarding route */}
        <Route path="/onboarding" element={<OnboardingFlow />} />

        {/* Main routes accessible only if onboarding complete */}
        {onboardingComplete && (
          <>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetail />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportId" element={<ReportDetail />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </>
        )}
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
