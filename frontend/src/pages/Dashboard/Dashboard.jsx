import React, { useState, useEffect } from ‘react’;
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from ‘recharts’;
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Lightbulb, Upload, Users, FileText, Calendar } from ‘lucide-react’;

function DashboardPage() {
const [selectedPeriod, setSelectedPeriod] = useState(‘30d’);
const [dashboardData, setDashboardData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
loadDashboardData();
}, [selectedPeriod]);

async function loadDashboardData() {
setLoading(true);
await new Promise(resolve => setTimeout(resolve, 800));

```
// Mock data - replace with actual API calls
const mockData = {
  kpis: {
    totalRevenue: 487500,
    revenueGrowth: 18.5,
    totalExpenses: 312000,
    expenseGrowth: -5.2,
    netProfit: 175500,
    profitMargin: 36.0,
    cashBalance: 234500,
    activeClients: 12
  },
  recentActivity: [
    { id: 1, type: 'upload', client: 'ABC Corp', description: 'Bank statements uploaded', time: '2 hours ago' },
    { id: 2, type: 'report', client: 'XYZ Ltd', description: 'Monthly P&L generated', time: '5 hours ago' },
    { id: 3, type: 'alert', client: 'Tech Startup', description: 'Cash flow alert triggered', time: '1 day ago' },
    { id: 4, type: 'forecast', client: 'Retail Co', description: 'Q2 forecast updated', time: '2 days ago' }
  ],
  monthlyTrend: [
    { month: 'Jan', revenue: 398000, expenses: 265000, profit: 133000 },
    { month: 'Feb', revenue: 415000, expenses: 278000, profit: 137000 },
    { month: 'Mar', revenue: 432000, expenses: 289000, profit: 143000 },
    { month: 'Apr', revenue: 461000, expenses: 301000, profit: 160000 },
    { month: 'May', revenue: 487500, expenses: 312000, profit: 175500 }
  ],
  clientBreakdown: [
    { name: 'Active', value: 12, color: '#10b981' },
    { name: 'Inactive', value: 3, color: '#ef4444' },
    { name: 'Trial', value: 5, color: '#f59e0b' }
  ]
};

setDashboardData(mockData);
setLoading(false);
```

}

if (loading) {
return (
<div className="flex items-center justify-center h-screen bg-gray-50">
<div className="text-center">
<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
<p className="text-gray-600 text-lg">Loading your dashboard…</p>
</div>
</div>
);
}

const kpis = dashboardData.kpis;

return (
<div className="min-h-screen bg-gray-50">
{/* Header */}
<div className="bg-white border-b border-gray-200">
<div className="max-w-7xl mx-auto px-4 py-6">
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
<p className="text-gray-600 mt-1">Welcome back! Here’s your financial overview.</p>
</div>
<div className="flex gap-2">
<select
value={selectedPeriod}
onChange={(e) => setSelectedPeriod(e.target.value)}
className=“px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent”
>
<option value="7d">Last 7 days</option>
<option value="30d">Last 30 days</option>
<option value="90d">Last 90 days</option>
<option value="1y">Last year</option>
</select>
</div>
</div>
</div>
</div>

```
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
    {/* KPI Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">Total Revenue</span>
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ${kpis.totalRevenue.toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>+{kpis.revenueGrowth}% this month</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">Total Expenses</span>
          <TrendingDown className="w-5 h-5 text-red-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ${kpis.totalExpenses.toLocaleString()}
        </div>
        <div className="flex items-center text-sm text-green-600">
          <TrendingDown className="w-4 h-4 mr-1" />
          <span>{kpis.expenseGrowth}% vs last month</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">Net Profit</span>
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ${kpis.netProfit.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          {kpis.profitMargin}% margin
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">Active Clients</span>
          <Users className="w-5 h-5 text-purple-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {kpis.activeClients}
        </div>
        <div className="text-sm text-gray-600">
          Managing portfolios
        </div>
      </div>
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Trend */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Profit Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue" dot={{ r: 5 }} />
            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Profit" dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Client Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dashboardData.clientBreakdown}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {dashboardData.clientBreakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {dashboardData.clientBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {dashboardData.recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activity.type === 'upload' ? 'bg-blue-100' :
              activity.type === 'report' ? 'bg-green-100' :
              activity.type === 'alert' ? 'bg-yellow-100' :
              'bg-purple-100'
            }`}>
              {activity.type === 'upload' && <Upload className="w-5 h-5 text-blue-600" />}
              {activity.type === 'report' && <FileText className="w-5 h-5 text-green-600" />}
              {activity.type === 'alert' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
              {activity.type === 'forecast' && <TrendingUp className="w-5 h-5 text-purple-600" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.client}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
            </div>
            <span className="text-xs text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-6 text-left transition-colors shadow-sm">
        <Upload className="w-8 h-8 mb-3" />
        <h3 className="text-lg font-semibold mb-2">Upload Data</h3>
        <p className="text-sm text-blue-100">Import CSV files for analysis</p>
      </button>

      <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 text-left transition-colors shadow-sm">
        <FileText className="w-8 h-8 mb-3" />
        <h3 className="text-lg font-semibold mb-2">Generate Report</h3>
        <p className="text-sm text-green-100">Create financial reports</p>
      </button>

      <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 text-left transition-colors shadow-sm">
        <Calendar className="w-8 h-8 mb-3" />
        <h3 className="text-lg font-semibold mb-2">View Forecasts</h3>
        <p className="text-sm text-purple-100">Check AI predictions</p>
      </button>
    </div>
  </div>
</div>
```

);
}

export default DashboardPage;
