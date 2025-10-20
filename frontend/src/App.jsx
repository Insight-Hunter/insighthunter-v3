// frontend/src/App.jsx
// Main React application component

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientProvider } from './contexts/ClientContext';

// Layout Components
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';t

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Main Pages
import Dashboard from './pages/Dashboard/DashboardPage';
import Clients from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import Upload from './pages/Upload/Upload';
import Reports from './pages/Reports/Reports';
import ReportDetail from './pages/Reports/ReportDetail';
import Forecasting from './pages/Forecasting/Forecasting';
import Alerts from './pages/Alerts/Alerts';
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
const { isAuthenticated, loading } = useAuth();

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

...
  {/* Client Portal (Semi-public) */}
  <Route path="/portal/:token" element={<ClientPortal />} />

  {/* Protected Routes */}
  <Route 
    element={
      isAuthenticated ? <Layout /> : <Navigate to="/login" />
    }
  >
    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="/dashboard" element={<Dashboard />} />
    
    <Route path="/clients" element={<Clients />} />
    <Route path="/clients/:clientId" element={<ClientDetail />} />
    
    <Route path="/upload" element={<Upload />} />
    
    <Route path="/reports" element={<Reports />} />
    <Route path="/reports/:reportId" element={<ReportDetail />} />
    
    <Route path="/forecasting" element={<Forecasting />} />
    
    <Route path="/alerts" element={<Alerts />} />
    
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
  </Route>

  {/* 404 Route */}
  <Route path="*" element={<NotFound />} />
</Routes>


);
}

export default App;
