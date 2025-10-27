// workers/management/permissions.js
// Feature access control based on user plan tiers

/**

- Plan features and limits configuration
- This defines what each pricing tier can access
  */
  export const PLAN_FEATURES = {
  free: {
  maxClients: 0,  // Cannot use client portal
  maxTransactionsPerMonth: 500,
  maxCsvUploads: 5,
  historicalDataMonths: 12,
  advancedForecasting: false,
  exportToPdf: false,
  aiInsights: false,
  emailSupport: false,
  apiAccess: false,
  customBranding: false
  },
  professional: {
  maxClients: 0,  // Still no client portal
  maxTransactionsPerMonth: 5000,
  maxCsvUploads: 50,
  historicalDataMonths: 36,
  advancedForecasting: true,
  exportToPdf: true,
  aiInsights: true,
  emailSupport: true,
  apiAccess: false,
  customBranding: false
  },
  enterprise: {
  maxClients: null,  // null means unlimited
  maxTransactionsPerMonth: null,
  maxCsvUploads: null,
  historicalDataMonths: null,
  advancedForecasting: true,
  exportToPdf: true,
  aiInsights: true,
  emailSupport: true,
  apiAccess: true,
  customBranding: true,
  dedicatedSupport: true
  }
  };

/**

- Check if a user has access to a specific feature
- @param {string} planType - User’s plan type
- @param {string} featureName - Feature to check
- @returns {boolean} Whether the feature is available
  */
  export function hasFeatureAccess(planType, featureName) {
  const features = PLAN_FEATURES[planType];
  if (!features) {
  // Invalid plan type, default to free tier permissions
  return PLAN_FEATURES.free[featureName] || false;
  }
  return features[featureName];
  }

/**

- Get user’s plan details including features
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @returns {Promise<Object|null>} Plan details or null if user not found
  */
  export async function getUserPlan(db, userId) {
  const user = await db.prepare(
  ‘SELECT plan_type, plan_expires_at FROM users WHERE id = ?’
  ).bind(userId).first();

if (!user) {
return null;
}

// Check if the plan has expired
const now = new Date().toISOString();
const isExpired = user.plan_expires_at && user.plan_expires_at < now;

// If expired, treat as free tier
const effectivePlanType = isExpired ? ‘free’ : user.plan_type;

return {
planType: effectivePlanType,
isExpired: isExpired,
expiresAt: user.plan_expires_at,
features: PLAN_FEATURES[effectivePlanType]
};
}

/**

- Check if user can perform an action based on usage limits
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @param {string} planType - User’s plan type
- @param {string} limitType - Type of limit to check
- @returns {Promise<Object>} Result with allowed status and details
  */
  export async function checkUsageLimit(db, userId, planType, limitType) {
  const features = PLAN_FEATURES[planType];
  const maxAllowed = features[limitType];

// Unlimited access
if (maxAllowed === null) {
return {
allowed: true,
current: null,
max: null,
remaining: ‘unlimited’
};
}

// Feature not available
if (maxAllowed === 0) {
return {
allowed: false,
current: 0,
max: 0,
reason: ‘Feature not available in your plan’,
upgradeRequired: limitType === ‘maxClients’ ? ‘enterprise’ : ‘professional’
};
}

// Query current usage
let current = 0;

if (limitType === ‘maxClients’) {
const result = await db.prepare(
‘SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND status = ?’
).bind(userId, ‘active’).first();
current = result.count;
} else if (limitType === ‘maxTransactionsPerMonth’) {
const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

```
const result = await db.prepare(
  'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND uploaded_at >= ?'
).bind(userId, monthStart.toISOString()).first();
current = result.count;
```

} else if (limitType === ‘maxCsvUploads’) {
const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

```
const result = await db.prepare(
  'SELECT COUNT(*) as count FROM csv_uploads WHERE user_id = ? AND uploaded_at >= ?'
).bind(userId, monthStart.toISOString()).first();
current = result.count;
```

}

const allowed = current < maxAllowed;

return {
allowed,
current,
max: maxAllowed,
remaining: maxAllowed - current,
reason: allowed ? null : `You have reached your plan limit of ${maxAllowed} ${limitType}`
};
}
