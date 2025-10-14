// frontend/src/components/UI/LoadingSpinner.jsx
// Loading indicator component

import React from ‘react’;

export default function LoadingSpinner({
size = ‘md’,
text = ‘’,
fullScreen = false
}) {
const sizes = {
sm: ‘w-4 h-4’,
md: ‘w-8 h-8’,
lg: ‘w-12 h-12’,
xl: ‘w-16 h-16’
};

const spinner = (
<div className="flex flex-col items-center justify-center gap-3">
<div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]}`} />
{text && (
<p className="text-sm text-gray-600">{text}</p>
)}
</div>
);

if (fullScreen) {
return (
<div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
{spinner}
</div>
);
}

return spinner;
}
