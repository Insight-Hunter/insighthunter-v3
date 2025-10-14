// frontend/src/components/Dashboard/RecentTransactions.jsx
// Recent transactions list component

import React from ‘react’;
import { ArrowUpRight, ArrowDownRight } from ‘lucide-react’;

export default function RecentTransactions({ transactions }) {
if (!transactions || transactions.length === 0) {
return (
<div className="text-center py-8 text-gray-500">
<p>No transactions yet</p>
<p className="text-sm mt-1">Upload some data to get started</p>
</div>
);
}

const formatDate = (dateString) => {
const date = new Date(dateString);
return date.toLocaleDateString(‘en-US’, {
month: ‘short’,
day: ‘numeric’,
year: ‘numeric’
});
};

const formatAmount = (amount) => {
return new Intl.NumberFormat(‘en-US’, {
style: ‘currency’,
currency: ‘USD’
}).format(amount);
};

return (
<div className="overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full">
<thead>
<tr className="border-b border-gray-200 text-left">
<th className="pb-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
<th className="pb-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
<th className="pb-3 text-xs font-semibold text-gray-600 uppercase">Category</th>
<th className="pb-3 text-xs font-semibold text-gray-600 uppercase text-right">Amount</th>
</tr>
</thead>
<tbody>
{transactions.map((transaction, index) => (
<tr
key={transaction.id || index}
className=“border-b border-gray-100 hover:bg-gray-50 transition-colors”
>
<td className="py-3 text-sm text-gray-600">
{formatDate(transaction.date)}
</td>
<td className="py-3">
<div className="flex items-center gap-2">
<div className={`w-8 h-8 rounded-full flex items-center justify-center ${ transaction.type === 'income'  ? 'bg-green-100 text-green-600'  : 'bg-red-100 text-red-600' }`}>
{transaction.type === ‘income’ ? (
<ArrowUpRight className="w-4 h-4" />
) : (
<ArrowDownRight className="w-4 h-4" />
)}
</div>
<span className="text-sm font-medium text-gray-900">
{transaction.description}
</span>
</div>
</td>
<td className="py-3">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
{transaction.category || ‘Uncategorized’}
</span>
</td>
<td className="py-3 text-right">
<span className={`text-sm font-semibold ${ transaction.type === 'income'  ? 'text-green-600'  : 'text-red-600' }`}>
{transaction.type === ‘income’ ? ‘+’ : ‘-’}
{formatAmount(transaction.amount)}
</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}
