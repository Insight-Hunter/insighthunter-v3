// permissions.js
// Central definition of what features are available in each pricing tier
// All Workers import this to check feature access consistently

export const PLAN_FEATURES = {
  free: {
    maxClients: 0,  // Cannot use client portal at all
    maxTransactionsPerMonth: 500,
    maxCsvUploads: 5,
    historicalDataMonths: 12,
    advancedForecasting: false,
    exportToPdf: false,
    aiInsights: false,
    emailSupport: false,
    apiAccess: false
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
    apiAccess: false
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

// Helper function to check if a user has access to a specific feature
export function hasFeatureAccess(planType, featureName) {
  const features = PLAN_FEATURES[planType];
  if (!features) {
    // If the plan type is invalid, default to free tier permissions
    return PLAN_FEATURES.free[featureName] || false;
  }
  return features[featureName];
}

// Helper function to check if a user can perform an action based on usage limits
export async function checkUsageLimit(db, userId, planType, limitType) {
  const features = PLAN_FEATURES[planType];
  const maxAllowed = features[limitType];
  
  // If the limit is null, it means unlimited access
  if (maxAllowed === null) {
    return { allowed: true, current: null, max: null };
  }
  
  // If the limit is 0, the feature is not available at all
  if (maxAllowed === 0) {
    return { allowed: false, current: 0, max: 0, reason: 'Feature not available in your plan' };
  }
  
  // Query the current usage based on what limit we're checking
  let current = 0;
  
  if (limitType === 'maxClients') {
    const result = await db.prepare(
      'SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND status = ?'
    ).bind(userId, 'active').first();
    current = result.count;
  } else if (limitType === 'maxTransactionsPerMonth') {
    // Calculate the start of the current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const result = await db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND uploaded_at >= ?'
    ).bind(userId, monthStart).first();
    current = result.count;
  } else if (limitType === 'maxCsvUploads') {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const result = await db.prepare(
      'SELECT COUNT(*) as count FROM csv_uploads WHERE user_id = ? AND uploaded_at >= ?'
    ).bind(userId, monthStart).first();
    current = result.count;
  }
  
  // Check if they're under the limit
  const allowed = current < maxAllowed;
  
  return {
    allowed,
    current,
    max: maxAllowed,
    reason: allowed ? null : `You have reached your plan limit of ${maxAllowed} ${limitType}`
  };
}

// Helper to get user's plan details including whether it's expired
export async function getUserPlan(db, userId) {
  const user = await db.prepare(
    'SELECT plan_type, plan_expires_at FROM users WHERE id = ?'
  ).bind(userId).first();
  
  if (!user) {
    return null;
  }
  
  // Check if the plan has expired
  const now = new Date().toISOString();
  const isExpired = user.plan_expires_at && user.plan_expires_at < now;
  
  // If the plan is expired, treat them as free tier
  const effectivePlanType = isExpired ? 'free' : user.plan_type;
  
  return {
    planType: effectivePlanType,
    isExpired: isExpired,
    expiresAt: user.plan_expires_at,
    features: PLAN_FEATURES[effectivePlanType]
  };
}
