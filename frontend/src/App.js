
// In your React app, after user logs in
const [userPlan, setUserPlan] = useState(null);
const [planFeatures, setPlanFeatures] = useState(null);
import React, { useState } from ‘react’;
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from ‘recharts’;
import { Upload, TrendingUp, DollarSign, AlertTriangle, FileText, Users, Download, Bell, Calendar, Activity } from ‘lucide-react’;
import InitialPrototype from './components/InitialPrototype';



}
// Sample data for demonstration
const generateMonthlyData = () => {
const months = [‘Jan’, ‘Feb’, ‘Mar’, ‘Apr’, ‘May’, ‘Jun’, ‘Jul’, ‘Aug’, ‘Sep’, ‘Oct’, ‘Nov’, ‘Dec’];
return months.map((month, idx) => ({
month,
revenue: 45000 + Math.random() * 15000 + idx * 2000,
expenses: 30000 + Math.random() * 8000 + idx * 1000,
profit: 15000 + Math.random() * 7000 + idx * 1000,
forecast: idx > 8 ? 50000 + Math.random() * 10000 : null
}));
};

const generateCashFlowData = () => {
const weeks = [‘Week 1’, ‘Week 2’, ‘Week 3’, ‘Week 4’, ‘Week 5’, ‘Week 6’];
return weeks.map((week, idx) => ({
week,
cashIn: 25000 + Math.random() * 10000,
cashOut: 20000 + Math.random() * 8000,
balance: 80000 + idx * 5000 + Math.random() * 5000
}));
};

const generateExpenseBreakdown = () => [
{ category: ‘Payroll’, amount: 35000, color: ‘#3b82f6’ },
{ category: ‘Marketing’, amount: 12000, color: ‘#8b5cf6’ },
{ category: ‘Operations’, amount: 8500, color: ‘#06b6d4’ },
{ category: ‘Technology’, amount: 6500, color: ‘#10b981’ },
{ category: ‘Other’, amount: 4000, color: ‘#f59e0b’ }
];

class AuthService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.token = localStorage.getItem('authToken');
  }
  
  async register(email, password, name) {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, name })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store the token in localStorage so it persists across page reloads
      localStorage.setItem('authToken', data.token);
      this.token = data.token;
      return data.user;
    } else {
      throw new Error(data.error);
    }
  }
  
  async login(email, password) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      this.token = data.token;
      return data.user;
    } else {
      throw new Error(data.error);
    }
  }
  
  async verifyToken() {
    if (!this.token) {
      return null;
    }
    
    const response = await fetch(`${this.apiUrl}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    } else {
      // Token is invalid or expired
      this.logout();
      return null;
    }
  }
  
  logout() {
    localStorage.removeItem('authToken');
    this.token = null;
  }
  
  getToken() {
    return this.token;
  }
}

export default AuthService;

useEffect(() => {
  async function fetchUserPlan() {
    const response = await fetch(`${API_URL}/user/plan`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setUserPlan(data.planType);
      setPlanFeatures(data.features);
    }
  }
  
  if (authToken) {
    fetchUserPlan();
  }
}, [authToken]);

// Later, when rendering navigation
{planFeatures?.maxClients > 0 && (
  <NavigationLink to="/clients">
    Client Portal
  </NavigationLink>
)}




const InsightHunterApp = () => {
const [activeTab, setActiveTab] = useState(‘dashboard’);
const [uploadedFile, setUploadedFile] = useState(null);
const [alerts, setAlerts] = useState([
{ id: 1, type: ‘warning’, message: ‘Cash flow projection shows potential shortage in 45 days’, date: ‘2025-10-05’ },
{ id: 2, type: ‘info’, message: ‘Revenue increased 12% compared to last month’, date: ‘2025-10-04’ },
{ id: 3, type: ‘alert’, message: ‘Marketing expenses exceeded budget by 8%’, date: ‘2025-10-03’ }
]);

const monthlyData = generateMonthlyData();
const cashFlowData = generateCashFlowData();
const expenseBreakdown = generateExpenseBreakdown();

const handleFileUpload = (event) => {
const file = event.target.files[0];
if (file) {
setUploadedFile(file);
// Simulate AI processing
setTimeout(() => {
alert(`AI Analysis Complete: ${file.name} processed successfully. Generated insights and updated forecasts.`);
}, 1500);
}
};

const KPICard = ({ title, value, change, icon: Icon, trend }) => (
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
<div className="flex items-center justify-between mb-2">
<span className="text-gray-600 text-sm font-medium">{title}</span>
<Icon className="w-5 h-5 text-gray-400" />
</div>
<div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
<div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
<TrendingUp className={`w-4 h-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
<span>{change}</span>
</div>
</div>
);

const renderDashboard = () => (
<div className="space-y-6">
{/* KPI Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<KPICard 
title="Monthly Revenue" 
value="$62,450" 
change="+12.5% vs last month" 
icon={DollarSign}
trend="up"
/>
<KPICard 
title="Net Profit" 
value="$24,890" 
change="+8.3% vs last month" 
icon={TrendingUp}
trend="up"
/>
<KPICard 
title="Cash Balance" 
value="$128,340" 
change="+5.2% vs last month" 
icon={Activity}
trend="up"
/>
<KPICard 
title="Burn Rate" 
value="$38,560" 
change="-3.1% vs last month" 
icon={AlertTriangle}
trend="down"
/>
</div>


  {/* Revenue vs Expenses Chart */}
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Expenses Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Revenue" />
        <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
      </AreaChart>
    </ResponsiveContainer>
  </div>

  {/* Cash Flow Projection */}
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">6-Week Cash Flow Projection</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={cashFlowData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="cashIn" fill="#10b981" name="Cash In" />
        <Bar dataKey="cashOut" fill="#ef4444" name="Cash Out" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Expense Breakdown */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={expenseBreakdown}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {expenseBreakdown.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Quick Stats */}
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
      <div className="space-y-4">
        {expenseBreakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-700">{item.category}</span>
            </div>
            <span className="font-semibold text-gray-900">${item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Total Expenses</span>
            <span className="text-xl font-bold text-gray-900">
              ${expenseBreakdown.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


);

const renderForecasting = () => (
<div className="space-y-6">
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
<h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Revenue Forecast</h3>
<p className="text-gray-600 mb-4">Machine learning models predict your financial trajectory based on historical data and market trends.</p>
<ResponsiveContainer width="100%" height={350}>
<LineChart data={monthlyData}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="month" />
<YAxis />
<Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
<Legend />
<Line type=“monotone” dataKey=“revenue” stroke=”#3b82f6” strokeWidth={2} name=“Actual Revenue” dot={{ r: 4 }} />
<Line type=“monotone” dataKey=“forecast” stroke=”#8b5cf6” strokeWidth={2} strokeDasharray=“5 5” name=“AI Forecast” dot={{ r: 4 }} />
</LineChart>
</ResponsiveContainer>
</div>


  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
      <h4 className="text-blue-900 font-semibold mb-2">30-Day Forecast</h4>
      <p className="text-3xl font-bold text-blue-900 mb-2">$68,200</p>
      <p className="text-blue-700 text-sm">Confidence: 92%</p>
    </div>
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6 border border-purple-200">
      <h4 className="text-purple-900 font-semibold mb-2">60-Day Forecast</h4>
      <p className="text-3xl font-bold text-purple-900 mb-2">$142,800</p>
      <p className="text-purple-700 text-sm">Confidence: 87%</p>
    </div>
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border border-green-200">
      <h4 className="text-green-900 font-semibold mb-2">90-Day Forecast</h4>
      <p className="text-3xl font-bold text-green-900 mb-2">$218,500</p>
      <p className="text-purple-700 text-sm">Confidence: 81%</p>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
    <div className="space-y-3">
      <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
        <TrendingUp className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Revenue Growth Trend</p>
          <p className="text-sm text-blue-700">Your revenue shows consistent 10-12% monthly growth. Model predicts this trend will continue.</p>
        </div>
      </div>
      <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-900">Seasonal Pattern Detected</p>
          <p className="text-sm text-yellow-700">Historical data shows Q4 typically sees 15-20% revenue increase. Factor this into planning.</p>
        </div>
      </div>
      <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200">
        <Activity className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
        <div>
          <p className="font-medium text-green-900">Healthy Cash Position</p>
          <p className="text-sm text-green-700">Current runway extends 8+ months at current burn rate. Strong financial position.</p>
        </div>
      </div>
    </div>
  </div>
</div>


);

const renderUpload = () => (
<div className="space-y-6">
<div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
<Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
<h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Financial Data</h3>
<p className="text-gray-600 mb-6">Upload CSV files containing bank transactions, P&L statements, or balance sheets for AI-powered analysis.</p>


    <label className="inline-block">
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileUpload}
        className="hidden"
      />
      <span className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block">
        Select File to Upload
      </span>
    </label>
    
    {uploadedFile && (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 font-medium">File uploaded: {uploadedFile.name}</p>
        <p className="text-green-600 text-sm mt-1">AI analysis in progress...</p>
      </div>
    )}
  </div>

  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported File Formats</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <FileText className="w-8 h-8 text-blue-600 mb-2" />
        <h4 className="font-medium text-gray-900 mb-1">Bank Transactions</h4>
        <p className="text-sm text-gray-600">CSV exports from your bank or accounting software</p>
      </div>
    
      <div className="p-4 border border-gray-200 rounded-lg">
        <FileText className="w-8 h-8 text-green-600 mb-2" />
        <h4 className="font-medium text-gray-900 mb-1">P&L Statements</h4>
        <p className="text-sm text-gray-600">Profit and loss statements in CSV or Excel format</p>
      </div>
    
      <div className="p-4 border border-gray-200 rounded-lg">
        <FileText className="w-8 h-8 text-purple-600 mb-2" />
        <h4 className="font-medium text-gray-900 mb-1">Balance Sheets</h4>
        <p className="text-sm text-gray-600">Financial position statements and reports</p>
      </div>
    
      <div className="p-4 border border-gray-200 rounded-lg">
        <FileText className="w-8 h-8 text-orange-600 mb-2" />
        <h4 className="font-medium text-gray-900 mb-1">Expense Reports</h4>
        <p className="text-sm text-gray-600">Detailed expense tracking and categorization</p>
      </div>
    </div>
  </div>
</div>


);

const renderAlerts = () => (
<div className="space-y-4">
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
<div className="flex items-center justify-between mb-4">
<h3 className="text-lg font-semibold text-gray-900">Active Alerts & Notifications</h3>
<Bell className="w-5 h-5 text-gray-400" />
</div>
  
<div className="space-y-3">
{alerts.map((alert) => (
<div
key={alert.id}
className={`p-4 rounded-lg border ${ alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : alert.type === 'alert' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200' }`}
>
<div className="flex items-start">
<AlertTriangle
className={`w-5 h-5 mr-3 mt-0.5 ${ alert.type === 'warning' ? 'text-yellow-600' : alert.type === 'alert' ? 'text-red-600' : 'text-blue-600' }`}
/>
<div className="flex-1">
<p className="font-medium text-gray-900">{alert.message}</p>
<p className="text-sm text-gray-600 mt-1">{alert.date}</p>
</div>
</div>
</div>
))}
</div>
</div>


  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
    <div className="space-y-3">
      <label className="flex items-center">
        <input type="checkbox" defaultChecked className="mr-3" />
        <span className="text-gray-700">Cash flow warnings</span>
      </label>
      <label className="flex items-center">
        <input type="checkbox" defaultChecked className="mr-3" />
        <span className="text-gray-700">Revenue milestones</span>
      </label>
      <label className="flex items-center">
        <input type="checkbox" defaultChecked className="mr-3" />
        <span className="text-gray-700">Expense budget alerts</span>
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-3" />
        <span className="text-gray-700">Weekly summary reports</span>
      </label>
    </div>
  </div>
</div>


);

const renderClientPortal = () => (
<div className="space-y-6">
<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
<h2 className="text-2xl font-bold mb-2">Client Financial Dashboard</h2>
<p className="text-blue-100">Share professional financial reports with your clients effortlessly</p>
</div>


  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Clients</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        <div className="flex items-center">
          <Users className="w-10 h-10 text-blue-600 mr-4" />
          <div>
            <p className="font-medium text-gray-900">Acme Corporation</p>
            <p className="text-sm text-gray-600">Last report: October 1, 2025</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          View Portal
        </button>
      </div>
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        <div className="flex items-center">
          <Users className="w-10 h-10 text-green-600 mr-4" />
          <div>
            <p className="font-medium text-gray-900">TechStart Inc.</p>
            <p className="text-sm text-gray-600">Last report: September 28, 2025</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          View Portal
        </button>
      </div>
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
        <div className="flex items-center">
          <Users className="w-10 h-10 text-purple-600 mr-4" />
          <div>
            <p className="font-medium text-gray-900">Global Ventures LLC</p>
            <p className="text-sm text-gray-600">Last report: September 25, 2025</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          View Portal
        </button>
      </div>
    </div>
  </div>

  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      <Download className="w-5 h-5 text-gray-400" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button className="p-4 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition">
        Generate Client Report
      </button>
      <button className="p-4 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition">
        Export to PDF
      </button>
      <button className="p-4 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition">
        Schedule Report Delivery
      </button>
      <button className="p-4 border-2 border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition">
        Create New Client
      </button>
    </div>
  </div>
</div>


);

return (
<div className="min-h-screen bg-gray-50">
{/* Header */}
<header className="bg-white shadow-sm border-b border-gray-200">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
<div className="flex items-center justify-between">
<div className="flex items-center">
<Activity className="w-8 h-8 text-blue-600 mr-3" />
<div>
<h1 className="text-2xl font-bold text-gray-900">Insight Hunter</h1>
<p className="text-sm text-gray-600">AI-Powered Auto-CFO Platform</p>
</div>
</div>
<div className="flex items-center space-x-4">
<button className="p-2 text-gray-600 hover:text-gray-900 relative">
<Bell className="w-6 h-6" />
<span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
</button>
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
Export Report
</button>
</div>
</div>
</div>
</

  {/* Navigation Tabs */}
  <nav className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex space-x-8">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
          { id: 'upload', label: 'Upload Data', icon: Upload },
          { id: 'alerts', label: 'Alerts', icon: Bell },
          { id: 'clients', label: 'Client Portal', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <tab.icon className="w-5 h-5 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  </nav>

  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {activeTab === 'dashboard' && renderDashboard()}
    {activeTab === 'forecasting' && renderForecasting()}
    {activeTab === 'upload' && renderUpload()}
    {activeTab === 'alerts' && renderAlerts()}
    {activeTab === 'clients' && renderClientPortal()}
  </main>

  {/* Footer */}
  <footer className="bg-white border-t border-gray-200 mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <p className="text-center text-gray-600 text-sm">
        © 2025 Insight Hunter. AI-Powered Financial Intelligence for Modern Businesses.
      </p>
    </div>
  </footer>
</div>


);
};

export default InsightHunterApp;

