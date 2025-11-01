import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar, Clock, Zap, RefreshCw, Download, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";

function CashFlowDashboard() {
const [autoRefresh, setAutoRefresh] = useState(true);
const [refreshInterval, setRefreshInterval] = useState(60); // seconds
const [lastUpdated, setLastUpdated] = useState(new Date());
const [cashFlowData, setCashFlowData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
loadCashFlowData();

```
if (autoRefresh) {
  const interval = setInterval(() => {
    loadCashFlowData();
  }, refreshInterval * 1000);
  
  return () => clearInterval(interval);
}
```

}, [autoRefresh, refreshInterval]);

const loadCashFlowData = async () => {
setLoading(true);

```
// Simulate API call - replace with actual endpoint
await new Promise(resolve => setTimeout(resolve, 800));

const mockData = {
  currentCash: 234567,
  projectedCash: {
    '7days': 218450,
    '30days': 195230,
    '90days': 312890
  },
  runway: {
    days: 127,
    date: '2025-09-26',
    status: 'healthy'
  },
  burnRate: {
    daily: 1850,
    weekly: 12950,
    monthly: 55760
  },
  inflows: {
    expected7d: 45000,
    expected30d: 198000,
    overdue: 12500
  },
  outflows: {
    scheduled7d: 61017,
    scheduled30d: 238537,
    recurring: 42800
  },
  historicalTrend: [
    { date: '2025-04-01', balance: 198000, inflow: 52000, outflow: 45000 },
    { date: '2025-04-08', balance: 203500, inflow: 48000, outflow: 42500 },
    { date: '2025-04-15', balance: 212000, inflow: 58000, outflow: 49500 },
    { date: '2025-04-22', balance: 218900, inflow: 55000, outflow: 48100 },
    { date: '2025-04-29', balance: 223400, inflow: 51000, outflow: 46500 },
    { date: '2025-05-06', balance: 228700, inflow: 57000, outflow: 51700 },
    { date: '2025-05-13', balance: 234567, inflow: 62000, outflow: 56133 }
  ],
  forecastTrend: [
    { date: '2025-05-20', balance: 228450, lower: 220000, upper: 236000, confidence: 0.92 },
    { date: '2025-05-27', balance: 218450, lower: 208000, upper: 228000, confidence: 0.89 },
    { date: '2025-06-03', balance: 212340, lower: 200000, upper: 224000, confidence: 0.85 },
    { date: '2025-06-10', balance: 205120, lower: 192000, upper: 218000, confidence: 0.82 },
    { date: '2025-06-17', balance: 195230, lower: 180000, upper: 210000, confidence: 0.78 },
    { date: '2025-06-24', balance: 198500, lower: 182000, upper: 215000, confidence: 0.75 },
    { date: '2025-07-01', balance: 208900, lower: 190000, upper: 227000, confidence: 0.72 },
    { date: '2025-07-08', balance: 225600, lower: 205000, upper: 246000, confidence: 0.69 },
    { date: '2025-07-15', balance: 248300, lower: 225000, upper: 271000, confidence: 0.67 }
  ],
  upcomingTransactions: [
    { id: 1, type: 'inflow', description: 'Client Payment - ABC Corp', amount: 25000, date: '2025-05-16', status: 'expected', confidence: 0.95 },
    { id: 2, type: 'inflow', description: 'Recurring Revenue - XYZ Tech', amount: 12000, date: '2025-05-18', status: 'recurring', confidence: 0.98 },
    { id: 3, type: 'outflow', description: 'Payroll Processing', amount: -42000, date: '2025-05-20', status: 'scheduled', confidence: 1.0 },
    { id: 4, type: 'inflow', description: 'Invoice Payment - Tech Startup', amount: 8000, date: '2025-05-22', status: 'overdue', confidence: 0.60 },
    { id: 5, type: 'outflow', description: 'Office Rent', amount: -8500, date: '2025-05-25', status: 'scheduled', confidence: 1.0 },
    { id: 6, type: 'outflow', description: 'Software Subscriptions', amount: -4200, date: '2025-05-28', status: 'recurring', confidence: 1.0 },
    { id: 7, type: 'inflow', description: 'New Contract - Retail Co', amount: 35000, date: '2025-05-30', status: 'expected', confidence: 0.85 }
  ],
  alerts: [
    {
      id: 1,
      type: 'warning',
      severity: 'medium',
      title: 'Cash Flow Dip Expected',
      message: 'Projected 7.4% decrease in cash balance over next 30 days',
      action: 'Review upcoming expenses'
    },
    {
      id: 2,
      type: 'info',
      severity: 'low',
      title: 'Overdue Invoice',
      message: '$12,500 from Tech Startup is 15 days overdue',
      action: 'Send payment reminder'
    },
    {
      id: 3,
      type: 'success',
      severity: 'low',
      title: 'Strong Recovery Projected',
      message: 'Cash balance expected to increase 60% by end of Q2',
      action: 'Consider strategic investments'
    }
  ],
  scenarios: [
    {
      name: 'Best Case',
      endBalance: 312890,
      probability: 0.25,
      assumptions: 'All invoices paid on time, no unexpected expenses'
    },
    {
      name: 'Expected Case',
      endBalance: 248300,
      probability: 0.55,
      assumptions: 'Normal payment delays, typical expense variance'
    },
    {
      name: 'Worst Case',
      endBalance: 178420,
      probability: 0.20,
      assumptions: '30% payment delays, 15% expense overruns'
    }
  ]
};

setCashFlowData(mockData);
setLastUpdated(new Date());
setLoading(false);
```

};

if (!cashFlowData) {
return (
<div className="flex items-center justify-center h-screen bg-gray-50">
<div className="text-center">
<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
<p className="text-gray-600 text-lg">Loading real-time cash flow data…</p>
</div>
</div>
);
}

const combinedTrend = [
…cashFlowData.historicalTrend.map(d => ({
date: d.date,
actual: d.balance,
forecast: null,
lower: null,
upper: null
})),
…cashFlowData.forecastTrend
];

const getRunwayStatus = (days) => {
if (days > 180) return { color: "text-green-600 bg-green-100", label: "Excellent" };
if (days > 90) return { color: "text-blue-600 bg-blue-100", label: "Healthy" };
if (days > 60) return { color: "text-yellow-600 bg-yellow-100", label: "Moderate" };
return { color: "text-red-600 bg-red-100", label: "Critical" };
};

const runwayStatus = getRunwayStatus(cashFlowData.runway.days);

return (
<div className="min-h-screen bg-gray-50">
{/* Header */}
<div className="bg-white border-b border-gray-200">
<div className="max-w-7xl mx-auto px-4 py-6">
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
<DollarSign className="w-8 h-8 text-blue-600" />
Real-Time Cash Flow
</h1>
<p className="text-gray-600 mt-1 flex items-center gap-2">
<Clock className="w-4 h-4" />
Last updated: {lastUpdated.toLocaleTimeString()}
</p>
</div>
<div className="flex gap-3">
<button
onClick={loadCashFlowData}
disabled={loading}
className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
>
<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
Refresh
</button>
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
<Download className="w-5 h-5" />
Export Report
</button>
</div>
</div>

```
      {/* Auto-refresh toggle */}
      <div className="mt-4 flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <Zap className="w-5 h-5 text-blue-600" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-900">Auto-refresh</span>
        </label>
        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          disabled={!autoRefresh}
          className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value={30}>Every 30s</option>
          <option value={60}>Every 1m</option>
          <option value={300}>Every 5m</option>
          <option value={600}>Every 10m</option>
        </select>
        <span className="text-sm text-gray-600 ml-auto">
          Real-time monitoring active
        </span>
      </div>
    </div>
  </div>

  <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Cash Balance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">Current Cash</span>
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ${cashFlowData.currentCash.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          As of {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Cash Runway */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">Cash Runway</span>
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {cashFlowData.runway.days} days
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${runwayStatus.color}`}>
          {runwayStatus.label}
        </span>
      </div>

      {/* Daily Burn Rate */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">Daily Burn Rate</span>
          <TrendingDown className="w-5 h-5 text-orange-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ${cashFlowData.burnRate.daily.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          ${cashFlowData.burnRate.monthly.toLocaleString()}/mo
        </div>
      </div>

      {/* 30-Day Projection */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-medium">30-Day Projection</span>
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ${cashFlowData.projectedCash['30days'].toLocaleString()}
        </div>
        <div className={`flex items-center text-sm ${
          cashFlowData.projectedCash['30days'] < cashFlowData.currentCash
            ? 'text-red-600'
            : 'text-green-600'
        }`}>
          {cashFlowData.projectedCash['30days'] < cashFlowData.currentCash ? (
            <>
              <ArrowDownRight className="w-4 h-4 mr-1" />
              <span>-{((1 - cashFlowData.projectedCash['30days'] / cashFlowData.currentCash) * 100).toFixed(1)}%</span>
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+{((cashFlowData.projectedCash['30days'] / cashFlowData.currentCash - 1) * 100).toFixed(1)}%</span>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Alerts */}
    {cashFlowData.alerts.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Active Alerts
        </h3>
        <div className="space-y-3">
          {cashFlowData.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{alert.title}</div>
                  <div className="text-sm text-gray-700 mb-2">{alert.message}</div>
                  <button className={`text-sm font-medium ${
                    alert.type === 'warning' ? 'text-yellow-700' :
                    alert.type === 'success' ? 'text-green-700' :
                    'text-blue-700'
                  }`}>
                    {alert.action} →
                  </button>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Cash Flow Forecast Chart */}
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">90-Day Cash Flow Forecast</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={combinedTrend}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e0e7ff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#e0e7ff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            stroke="#6b7280"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value, name) => {
              if (!value) return null;
              return [`$${value.toLocaleString()}`, name];
            }}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#colorConfidence)"
            name="Confidence Range"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#fff"
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorActual)"
            name="Actual Balance"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#8b5cf6"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            name="Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">AI Confidence:</span> The shaded area represents the confidence interval. 
          Narrower bands indicate higher prediction accuracy.
        </div>
      </div>
    </div>

    {/* Inflows vs Outflows */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expected Inflows */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-green-600" />
          Expected Inflows
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Next 7 Days</div>
              <div className="text-2xl font-bold text-gray-900">
                ${cashFlowData.inflows.expected7d.toLocaleString()}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Next 30 Days</div>
              <div className="text-2xl font-bold text-gray-900">
                ${cashFlowData.inflows.expected30d.toLocaleString()}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          {cashFlowData.inflows.overdue > 0 && (
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <div className="text-sm text-red-600 font-medium">Overdue Invoices</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${cashFlowData.inflows.overdue.toLocaleString()}
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Outflows */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ArrowDownRight className="w-5 h-5 text-red-600" />
          Scheduled Outflows
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Next 7 Days</div>
              <div className="text-2xl font-bold text-gray-900">
                ${cashFlowData.outflows.scheduled7d.toLocaleString()}
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Next 30 Days</div>
              <div className="text-2xl font-bold text-gray-900">
                ${cashFlowData.outflows.scheduled30d.toLocaleString()}
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Recurring Monthly</div>
              <div className="text-2xl font-bold text-gray-900">
                ${cashFlowData.outflows.recurring.toLocaleString()}
              </div>
            </div>
            <RefreshCw className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>
    </div>

    {/* Upcoming Transactions */}
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Transactions (Next 14 Days)</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cashFlowData.upcomingTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {txn.description}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    txn.status === 'recurring' ? 'bg-blue-100 text-blue-800' :
                    txn.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                    txn.status === 'expected' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {txn.status}
                  </span>
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-semibold ${
                  txn.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {txn.type === 'inflow' ? '+' : ''${Math.abs(txn.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${txn.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{(txn.confidence * 100).toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Scenario Planning */}
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-600" />
        Scenario Planning (90-Day Outlook)
      </h3
```
