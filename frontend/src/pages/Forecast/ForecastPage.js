import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertCircle, Zap, RefreshCw, } from 'lucide-react';
function ForecastsPage() {
    const [timeRange, setTimeRange] = useState('90days');
    const [forecastType, setForecastType] = useState('revenue');
    const forecastData = {
        revenue: {
            historical: [
                { month: 'Jan', actual: 398000, forecast: null },
                { month: 'Feb', actual: 415000, forecast: null },
                { month: 'Mar', actual: 432000, forecast: null },
                { month: 'Apr', actual: 461000, forecast: null },
                { month: 'May', actual: 487500, forecast: null },
            ],
            predictions: [
                { month: 'Jun', actual: null, forecast: 512000, lower: 485000, upper: 540000 },
                { month: 'Jul', actual: null, forecast: 538000, lower: 505000, upper: 570000 },
                { month: 'Aug', actual: null, forecast: 565000, lower: 525000, upper: 605000 },
                { month: 'Sep', actual: null, forecast: 590000, lower: 545000, upper: 635000 },
            ],
            confidence: 87,
            trend: 'increasing',
            growth: 16.5,
        },
        expenses: {
            historical: [
                { month: 'Jan', actual: 265000, forecast: null },
                { month: 'Feb', actual: 278000, forecast: null },
                { month: 'Mar', actual: 289000, forecast: null },
                { month: 'Apr', actual: 301000, forecast: null },
                { month: 'May', actual: 312000, forecast: null },
            ],
            predictions: [
                { month: 'Jun', actual: null, forecast: 320000, lower: 305000, upper: 335000 },
                { month: 'Jul', actual: null, forecast: 328000, lower: 310000, upper: 345000 },
                { month: 'Aug', actual: null, forecast: 335000, lower: 315000, upper: 355000 },
                { month: 'Sep', actual: null, forecast: 342000, lower: 320000, upper: 365000 },
            ],
            confidence: 82,
            trend: 'increasing',
            growth: 5.2,
        },
        profit: {
            historical: [
                { month: 'Jan', actual: 133000, forecast: null },
                { month: 'Feb', actual: 137000, forecast: null },
                { month: 'Mar', actual: 143000, forecast: null },
                { month: 'Apr', actual: 160000, forecast: null },
                { month: 'May', actual: 175500, forecast: null },
            ],
            predictions: [
                { month: 'Jun', actual: null, forecast: 192000, lower: 175000, upper: 210000 },
                { month: 'Jul', actual: null, forecast: 210000, lower: 190000, upper: 230000 },
                { month: 'Aug', actual: null, forecast: 230000, lower: 205000, upper: 255000 },
                { month: 'Sep', actual: null, forecast: 248000, lower: 220000, upper: 275000 },
            ],
            confidence: 85,
            trend: 'increasing',
            growth: 28.3,
        },
    };
    const currentForecast = forecastData[forecastType];
    const combinedData = [...currentForecast.historical, ...currentForecast.predictions];
    const insights = [
        {
            type: 'positive',
            title: 'Strong Revenue Growth',
            description: 'Revenue forecast shows sustained growth of 16.5% over next quarter',
            icon: TrendingUp,
            color: 'text-green-600 bg-green-100',
        },
        {
            type: 'warning',
            title: 'Expense Management',
            description: 'Expenses increasing at 5.2% - consider cost optimization opportunities',
            icon: AlertCircle,
            color: 'text-yellow-600 bg-yellow-100',
        },
        {
            type: 'positive',
            title: 'Profit Acceleration',
            description: 'Net profit projected to grow 28.3% - well above industry average',
            icon: Zap,
            color: 'text-blue-600 bg-blue-100',
        },
    ];
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Forecasts</h1>
              <p className="text-gray-600 mt-1">Predictive insights powered by machine learning</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium" onClick={() => {
            // Add recalculate logic here if necessary
        }}>
              <RefreshCw className="w-5 h-5"/>
              Recalculate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-400"/>
              <span className="text-sm font-medium text-gray-700">Forecast:</span>
            </div>
            <div className="flex gap-2">
              {['revenue', 'expenses', 'profit'].map((type) => (<button key={type} onClick={() => setForecastType(type)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${forecastType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>))}
            </div>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
            </select>
          </div>
        </div>

        {/* Forecast Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Confidence Score</span>
              <Zap className="w-5 h-5 text-purple-600"/>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{currentForecast.confidence}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${currentForecast.confidence}%` }}/>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Trend Direction</span>
              {currentForecast.trend === 'increasing' ? (<TrendingUp className="w-5 h-5 text-green-600"/>) : (<TrendingDown className="w-5 h-5 text-red-600"/>)}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2 capitalize">{currentForecast.trend}</div>
            <div className={`text-sm ${currentForecast.trend === 'increasing' ? 'text-green-600' : 'text-red-600'}`}>
              Strong upward momentum
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Projected Growth</span>
              <TrendingUp className="w-5 h-5 text-blue-600"/>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">+{currentForecast.growth}%</div>
            <div className="text-sm text-gray-600">Next quarter vs current</div>
          </div>
        </div>

        {/* Main Forecast Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {forecastType.charAt(0).toUpperCase() + forecastType.slice(1)} Forecast
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis />
              <Tooltip />
              <Legend />

              {/* Actual values */}
              <Area type="monotone" dataKey="actual" stroke="#8884d8" fillOpacity={1} fill="url(#colorForecast)" connectNulls/>

              {/* Forecast values */}
              <Area type="monotone" dataKey="forecast" stroke="#82ca9d" fillOpacity={0.6} fill="url(#colorConfidence)" connectNulls/>

              {/* Confidence interval upper bound */}
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#colorConfidence)" fillOpacity={0.1} activeDot={false} isAnimationActive={false} connectNulls/>

              {/* Confidence interval lower bound */}
              <Area type="monotone" dataKey="lower" stroke="none" fill="#fff" fillOpacity={1} activeDot={false} isAnimationActive={false} connectNulls/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map(({ type, title, description, icon: Icon, color }) => (<div key={title} className={`flex items-center gap-4 p-4 rounded-lg border ${type === 'positive' ? 'border-green-200' : 'border-yellow-200'} bg-white shadow-sm`}>
              <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6"/>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{title}</h4>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
}
export default ForecastsPage;
