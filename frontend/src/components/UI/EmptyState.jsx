// frontend/src/components/UI/EmptyState.jsx
// Empty state placeholder component

import React from ‘react’;
import Button from ‘./Button’;

export default function EmptyState({
icon: Icon,
title,
description,
action,
actionLabel,
secondaryAction,
secondaryActionLabel
}) {
return (
<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
{Icon && (
<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
<Icon className="w-8 h-8 text-gray-400" />
</div>
)}

```
  {title && (
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
  )}
  
  {description && (
    <p className="text-sm text-gray-600 max-w-md mb-6">
      {description}
    </p>
  )}
  
  {(action || secondaryAction) && (
    <div className="flex gap-3">
      {action && (
        <Button onClick={action} variant="primary">
          {actionLabel || 'Get Started'}
        </Button>
      )}
      
      {secondaryAction && (
        <Button onClick={secondaryAction} variant="outline">
          {secondaryActionLabel || 'Learn More'}
        </Button>
      )}
    </div>
  )}
</div>
```

);
}
