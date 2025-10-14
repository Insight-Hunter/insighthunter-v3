// frontend/src/components/Charts/Chart.jsx
// Reusable chart component wrapper for Chart.js

import React from ‘react’;
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
PointElement,
LineElement,
BarElement,
ArcElement,
Title,
Tooltip,
Legend,
Filler
} from ‘chart.js’;
import { Line, Bar, Pie, Doughnut } from ‘react-chartjs-2’;

// Register Chart.js components
ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
BarElement,
ArcElement,
Title,
Tooltip,
Legend,
Filler
);

export default function Chart({ type, data, options = {}, height = 300 }) {
const defaultOptions = {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: {
position: ‘bottom’,
labels: {
padding: 15,
usePointStyle: true,
font: {
size: 12
}
}
},
tooltip: {
mode: ‘index’,
intersect: false,
backgroundColor: ‘rgba(0, 0, 0, 0.8)’,
padding: 12,
cornerRadius: 8,
titleFont: {
size: 13,
weight: ‘bold’
},
bodyFont: {
size: 12
},
callbacks: {
label: function(context) {
let label = context.dataset.label || ‘’;
if (label) {
label += ’: ’;
}
if (context.parsed.y !== null) {
label += new Intl.NumberFormat(‘en-US’, {
style: ‘currency’,
currency: ‘USD’
}).format(context.parsed.y);
}
return label;
}
}
}
},
scales: type !== ‘pie’ && type !== ‘doughnut’ ? {
y: {
beginAtZero: true,
grid: {
color: ‘rgba(0, 0, 0, 0.05)’
},
ticks: {
callback: function(value) {
return ‘$’ + value.toLocaleString();
}
}
},
x: {
grid: {
display: false
}
}
} : undefined
};

const mergedOptions = { …defaultOptions, …options };

const chartComponents = {
line: Line,
bar: Bar,
pie: Pie,
doughnut: Doughnut
};

const ChartComponent = chartComponents[type] || Line;

if (!data || !data.labels || !data.datasets) {
return (
<div className="flex items-center justify-center h-full text-gray-500">
<p>No data available</p>
</div>
);
}

return (
<div style={{ height: `${height}px` }}>
<ChartComponent data={data} options={mergedOptions} />
</div>
);
}
