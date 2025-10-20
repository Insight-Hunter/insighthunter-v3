import React, { useState, useEffect } from ‘react’;
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from ‘recharts’;
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Lightbulb, Upload } from ‘lucide-react’;

// Mock CSV Upload Component (simplified)
function CSVUpload({ clientId, onUploadComplete }) {
const handleFileUpload = (e) => {
const file = e.target.files[0];
if (file) {
// Simulate upload
setTimeout(() => {
onUploadComplete({ success: true, fileName: file.name });
}, 1000);
}
};

return (
<div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300">
<div className="flex items-center justify-center">
<label className="cursor-pointer flex flex-col items-center">
<Upload className="w-8 h-8 text-blue-600 mb-2" />
<span className="text-sm text-gray-600 mb-2">Upload CSV File</span>
<input
type="file"
accept=".csv"
onChange={handleFileUpload}
className="hidden"
/>
<span className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
Choose File
</span>
</label>
</div>
</div>
);
}

function AnalyticsDashboard({ clientId = null }) {
const [dashboardData, setDashboardData] = useState(null);
const [insights, setInsights] = useState(null);
const [forecast, setForecast] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [selectedClient, setSelectedClient] = useState(null);

useEffect(() => {
loadDashboardData();
}, [clientId]);

async function loadDashboardData() {
setLoading(true);
setError(null);

```
try {
  // Mock data instead of actual API calls
  // In production, replace with actual fetch calls
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockDashboardData = {
    kpis: {
      monthlyRevenue: 125000,
      revenueChange: 12.5,
      monthlyExpenses: 78000,
      netProfit: 47000,
      profitMargin: 37.6
    },
    monthlyTrend: [
      { month: 'Jan', revenue: 98000, expenses: 65000 },
      { month: 'Feb', revenue: 105000, expenses: 68000 },
      { month: 'Mar', revenue: 112000, expenses: 72000 },
      { month: 'Apr', revenue: 118000, expenses: 75000 },
      { month: 'May', revenue: 125000, expenses: 78000 }
    ],
    categoryBreakdown: [
      { category: 'Payroll', total: 35000, count: 45 },
      { category: 'Marketing', total: 15000, count: 28 },
      { category: 'Office Supplies', total: 8000, count: 67 },
      { category: 'Software', total: 12000, count: 15 },
      { category: 'Travel', total: 5000, count: 12 },
      { category: 'Utilities', total: 3000, count: 8 }
    ],
    generatedAt: new Date().toISOString(),
    fromCache: false
  };

  const mockInsights = {
    insights: [
      'Revenue growth is accelerating with a 12.5% increase compared to last month',
      'Marketing expenses have decreased by 8% while revenue increased, showing improved ROI',
      'Your profit margin of 37.6% is above industry average of 32%'
    ],
    anomalies: [
      {
        type: 'expense_spike',
        severity: 'medium',
        message: 'Software expenses increased by 45% this month',
        historical: 8200,
        current: 12000
      }
    ]
  };

  const mockForecast = {
    forecasts: {
      revenue: {
        forecasts: [
          { periodLabel: 'Jun', value: 131000 },
          { periodLabel: 'Jul', value: 138000 },
          { periodLabel: 'Aug', value: 145000 }
        ],
        trend: 'increasing',
        confidence: 0.87
      }
    },
    seasonality: [
      { monthName: 'December', pattern: 'high', deviation: 25 },
      { monthName: 'July', pattern: 'low', deviation: 15 }
    ]
  };

  setDashboardData(mockDashboardData);
  setInsights(mockInsights);
  setForecast(mockForecast);

} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

}

const handleUploadComplete = (uploadResult) => {
console.log(‘Upload completed:’, uploadResult);
loadDashboardData();
};

if (loading) {
return (
<div className="flex items-center justify-center h-64">
<div className="text-center">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
<p className="text-gray-600">Loading your financial intelligence…</p>
</div>
</div>
);
}

if (error) {
return (
<div className="bg-red-50 border border-red-200 rounded-lg p-6">
<p className="text-red-800">Error loading dashboard: {error}</p>
<button 
onClick={loadDashboardData}
className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
>
Retry
</button>
</div>
);
}

const kpis = dashboardData.kpis;
const revenueChangePositive = parseFloat(kpis.revenueChange) >= 0;

return (
<div className="min-h-screen bg-gray-50">
<div className="max-w-7xl mx-auto px-4 py-8">
<h1 className="text-3xl font-bold text-gray-900 mb-8">
Financial Dashboard
</h1>

```
    <div className="mb-8">
      <CSVUpload 
        clientId={selectedClient?.id}
        onUploadComplete={handleUploadComplete}
      />
    </div>

    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Monthly Revenue</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ${kpis.monthlyRevenue.toLocaleString()}
          </div>
          <div className={`flex items-center text-sm ${revenueChangePositive ? 'text-green-600' : 'text-red-600'}`}>
            {revenueChangePositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{revenueChangePositive ? '+' : ''}{kpis.revenueChange}% vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Monthly Expenses</span>
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ${kpis.monthlyExpenses.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Operating costs
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Net Profit</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ${kpis.netProfit.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {kpis.profitMargin}% margin
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Forecast Confidence</span>
            <AlertTriangle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {(forecast.forecasts.revenue.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">
            Prediction reliability
          </div>
        </div>
      </div>

      {/* AI-Generated Insights */}
      {insights && insights.insights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Alerts */}
      {insights && insights.anomalies.length > 0 && (
        <div className="bg-yellow-50 rounded-lg shadow-md p-6 border border-yellow-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Attention Needed</h3>
          </div>
          <div className="space-y-3">
            {insights.anomalies.map((anomaly, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                anomaly.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="font-medium text-gray-900">{anomaly.message}</p>
                {anomaly.type === 'expense_spike' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Historical average: ${anomaly.historical.toFixed(0)} | Current: ${anomaly.current.toFixed(0)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Trend with Forecast */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend & Forecast</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            ...dashboardData.monthlyTrend.map(d => ({
              month: d.month,
              actual: d.revenue,
              forecast: null
            })),
            ...forecast.forecasts.revenue.forecasts.map(f => ({
              month: f.periodLabel,
              actual: null,
              forecast: f.value
            }))
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => value ? `$${value.toLocaleString()}` : 'N/A'} />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual Revenue" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Forecast" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          <p>Forecast trend: <span className="font-medium">{forecast.forecasts.revenue.trend}</span></p>
          <p>Confidence: <span className="font-medium">{(forecast.forecasts.revenue.confidence * 100).toFixed(0)}%</span></p>
        </div>
      </div>

      {/* Expense Category Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboardData.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {dashboardData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / dashboardData.categoryBreakdown.length}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {dashboardData.categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: `hsl(${idx * 360 / dashboardData.categoryBreakdown.length}, 70%, 60%)` }}
                  ></div>
                  <span className="text-gray-700 font-medium">{cat.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${cat.total.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">{cat.count} transactions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonality Information */}
      {forecast.seasonality && forecast.seasonality.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Patterns Detected</h3>
          <p className="text-gray-700 mb-3">
            Your business shows seasonal patterns. Plan accordingly for these months:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forecast.seasonality.map((season, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                season.pattern === 'high' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="font-semibold text-gray-900">{season.monthName}</div>
                <div className={`text-sm ${season.pattern === 'high' ? 'text-green-700' : 'text-orange-700'}`}>
                  {season.pattern === 'high' ? 'Typically' : 'Usually'} {Math.abs(season.deviation)}% {season.pattern === 'high' ? 'higher' : 'lower'} than average
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data freshness indicator */}
      <div className="text-center text-sm text-gray-500">
        Data generated at {new Date(dashboardData.generatedAt).toLocaleString()}
        {dashboardData.fromCache && <span className="ml-2">(cached)</span>}
      </div>
    </div>
  </div>
</div>
```

);
}

export default AnalyticsDashboard;
