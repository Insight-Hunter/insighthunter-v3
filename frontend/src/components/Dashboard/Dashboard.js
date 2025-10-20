import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  FileText,
  Upload,
  BarChart3
} from 'lucide-react';
import { analyticsAPI, clientsAPI, managementAPI } from '../../services/api';
import KPICard from '../../components/Dashboard/KPICard';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import Chart from '../../components/Charts/Chart';

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
  };

  const loadClientDashboard = async (clientId) => {
    try {
      const response = await analyticsAPI.getDashboardData(clientId);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load client dashboard:', error);
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

        <KPICard
          title="Net Income"
          value={`$${(kpis.netIncome || 0).toLocaleString()}`}
          change={kpis.netIncomeChange}
          icon={<TrendingUp className="w-6 h-6" />}
          color={kpis.netIncome >= 0 ? 'green' : 'red'}
        />

        <KPICard
          title="Profit Margin"
          value={`${(kpis.profitMargin || 0).toFixed(1)}%`}
          change={kpis.marginChange}
          icon={<BarChart3 className="w-6 h-6" />}
          color={kpis.profitMargin >= 20 ? 'green' : 'yellow'}
        />
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trend</h3>
          {dashboardData?.recentTransactions && (
            <Chart
              type="line"
              data={prepareCashFlowData(dashboardData.recentTransactions)}
            />
          )}
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
          {dashboardData?.recentTransactions && (
            <Chart
              type="bar"
              data={prepareIncomeExpenseData(dashboardData.recentTransactions)}
            />
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link
            to={`/clients/${selectedClient}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <RecentTransactions
          transactions={dashboardData?.recentTransactions || []}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/upload"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <Upload className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Upload Data</h3>
          <p className="text-sm text-gray-600">Import CSV files with financial transactions</p>
        </Link>

        <Link
          to="/reports"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <FileText className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Generate Report</h3>
          <p className="text-sm text-gray-600">Create P&L, balance sheets, and more</p>
        </Link>

        <Link
          to="/forecasting"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <BarChart3 className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">View Forecasts</h3>
          <p className="text-sm text-gray-600">AI-powered financial predictions</p>
        </Link>
      </div>
    </div>
  );
}

// Helper functions to prepare chart data
function prepareCashFlowData(transactions) {
  const dailyData = {};

  transactions.forEach(t => {
    const date = new Date(t.date).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = 0;
    }
    dailyData[date] += t.type === 'income' ? t.amount : -t.amount;
  });

  const dates = Object.keys(dailyData).sort();
  let runningBalance = 0;

  return {
    labels: dates.map(d =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Cash Flow',
        data: dates.map(date => {
          runningBalance += dailyData[date];
          return runningBalance;
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };
}

function prepareIncomeExpenseData(transactions) {
  const monthlyData = {};

  transactions.forEach(t => {
    const month = new Date(t.date).toISOString().slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expenses += t.amount;
    }
  });

  const months = Object.keys(monthlyData).sort();

  return {
    labels: months.map(m =>
      new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ),
    datasets: [
      {
        label: 'Income',
        data: months.map(m => monthlyData[m].income),
        backgroundColor: 'rgba(34, 197, 94, 0.8)'
      },
      {
        label: 'Expenses',
        data: months.map(m => monthlyData[m].expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.8)'
      }
    ]
  };
}
