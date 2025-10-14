// frontend/src/components/Dashboard/KPICard.jsx
// KPI display card component

import React from ‘react’;
import { TrendingUp, TrendingDown, Minus } from ‘lucide-react’;

export default function KPICard({ title, value, change, icon, color = ‘blue’ }) {
const colorClasses = {
blue: ‘bg-blue-100 text-blue-600’,
green: ‘bg-green-100 text-green-600’,
red: ‘bg-red-100 text-red-600’,
yellow: ‘bg-yellow-100 text-yellow-600’,
purple: ‘bg-purple-100 text-purple-600’
};

const getTrendColor = (changeValue) => {
if (!changeValue) return ‘text-gray-500’;
return changeValue > 0 ? ‘text-green-600’ : ‘text-red-600’;
};

const getTrendIcon = (changeValue) => {
if (!changeValue || changeValue === 0) return <Minus className="w-4 h-4" />;
return changeValue > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
};

return (
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
<div className="flex items-start justify-between">
<div className="flex-1">
<p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
<p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>


      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(change)}`}>
          {getTrendIcon(change)}
          <span>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-gray-500 font-normal ml-1">vs last period</span>
        </div>
      )}
    </div>

    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
      {icon}
    </div>
  </div>
</div>

);
}
