// frontend/src/pages/Dashboard/Dashboard.jsx
// Main dashboard with KPIs and overview

import React, { useState, useEffect } from ‘react’;
import { Link } from ‘react-router-dom’;
import {
DollarSign, TrendingUp, TrendingDown, AlertCircle,
Users, FileText, Upload, BarChart3
} from ‘lucide-react’;
import { analyticsAPI, clientsAPI, managementAPI } from ‘../../services/api’;
import KPICard from ‘../../components/Dashboard/KPICard’;
import RecentTransactions from ‘../../components/Dashboard/RecentTransactions’;
import Chart from ‘../../components/Charts/Chart’;

export default function Dashboard() {
const [loading, setLoading] = useState(true);
const [selectedClient, setSelectedClient] = useState(null);
const [clients, setClients] = useState([]);
const [dashboardData, setDashboardData] = useState(null);
const [alerts, setAlerts] = useState([]);

useEffect(() => {
loadDashboardData();
}, []);

useEffect(() => {
if (selectedClient) {
loadClientDashboard(selectedClient);
}
}, [selectedClient]);

const loadDashboardData = async () => {
try {
setLoading(true);

```
  // Load clients
  const clientsResponse = await clientsAPI.getAll();
  setClients(clientsResponse.data.clients);

  // Select first client by default
  if (clientsResponse.data.clients.length > 0) {
    setSelectedClient(clientsResponse.data.clients[0].id);
  }

  // Load alerts
  const alertsResponse = await managementAPI.getAlerts(true);
  setAlerts(alertsResponse.data.alerts.slice(0, 5));

} catch (error) {
  console.error('Failed to load dashboard:', error);
} finally {
  setLoading(false);
}
```

};

const loadClientDashboard = async (clientId) => {
try {
const response = await analyticsAPI.getDashboardData(clientId);
setDashboardData(response.data);
} catch (error) {
console.error(‘Failed to load client dashboard:’, error);
}
};

if (loading) {
return (
<div className="flex items-center justify-center h-96">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
</div>
);
}

if (clients.length === 0) {
return (
<div className="max-w-2xl mx-auto mt-12 text-center">
<Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
<h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Insight Hunter!</h2>
<p className="text-gray-600 mb-6">
Get started by adding your first client and uploading their financial data.
</p>
<div className="flex gap-4 justify-center">
<Link 
to="/clients"
className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
<Users className="w-4 h-4 mr-2" />
Add Client
</Link>
<Link 
to="/upload"
className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
>
<Upload className="w-4 h-4 mr-2" />
Upload Data
</Link>
</div>
</div>
);
}

const kpis = dashboardData?.kpis || {};

return (
<div className="space-y-6">
{/* Header */}
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
<p className="text-gray-600 mt-1">Financial overview and key metrics</p>
</div>

```
    {/* Client Selector */}
    <select
      value={selectedClient || ''}
      onChange={(e) => setSelectedClient(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {clients.map(client => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  </div>

  {/* Alerts */}
  {alerts.length > 0 && (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex">
        <AlertCircle className="w-5 h-5 text-yellow-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            You have {alerts.length} unread alert{alerts.length !== 1 ? 's' : ''}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <Link to="/alerts" className="font-medium underline hover:text-yellow-600">
              View all alerts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* KPI Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <KPICard
      title="Total Income"
      value={`$${(kpis.totalIncome || 0).toLocaleString()}`}
      change={kpis.incomeChange}
      icon={<DollarSign className="w-6 h-6" />}
      color="green"
    />
    
    <KPICard
      title="Total Expenses"
      value={`$${(kpis.totalExpenses || 0).toLocaleString()}`}
      change={kpis.expenseChange}
      icon={<TrendingDown className="w-6 h-6" />}
      color="red"
    />
```
