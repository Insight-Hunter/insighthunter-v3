// shared/permissions.js
// Plan features and access control for Insight Hunter

export const PLANS = {
FREE: ‘free’,
STARTER: ‘starter’,
PROFESSIONAL: ‘professional’,
ENTERPRISE: ‘enterprise’
};

export const PLAN_LIMITS = {
[PLANS.FREE]: {
maxClients: 1,
maxTransactions: 100,
maxReports: 3,
csvUploads: 5,
aiInsights: false,
forecasting: false,
alerts: false,
clientPortal: false,
exportPDF: false,
dataRetentionDays: 30,
apiAccess: false
},
[PLANS.STARTER]: {
maxClients: 5,
maxTransactions: 1000,
maxReports: 25,
csvUploads: 50,
aiInsights: true,
forecasting: true,
alerts: true,
clientPortal: false,
exportPDF: true,
dataRetentionDays: 90,
apiAccess: false
},
[PLANS.PROFESSIONAL]: {
maxClients: 25,
maxTransactions: 10000,
maxReports: 100,
csvUploads: 500,
aiInsights: true,
forecasting: true,
alerts: true,
clientPortal: true,
exportPDF: true,
dataRetentionDays: 365,
apiAccess: true
},
[PLANS.ENTERPRISE]: {
maxClients: Infinity,
maxTransactions: Infinity,
maxReports: Infinity,
csvUploads: Infinity,
aiInsights: true,
forecasting: true,
alerts: true,
clientPortal: true,
exportPDF: true,
dataRetentionDays: Infinity,
apiAccess: true
}
};

export const FEATURES = {
AI_INSIGHTS: ‘aiInsights’,
FORECASTING: ‘forecasting’,
ALERTS: ‘alerts’,
CLIENT_PORTAL: ‘clientPortal’,
EXPORT_PDF: ‘exportPDF’,
API_ACCESS: ‘apiAccess’
};

/**

- Check if a user has access to a specific feature
- @param {string} userPlan - User’s current plan
- @param {string} feature - Feature to check (from FEATURES constant)
- @returns {boolean} - Whether user has access
  */
  export function hasFeatureAccess(userPlan, feature) {
  const plan = PLAN_LIMITS[userPlan];
  if (!plan) return false;
  return plan[feature] === true;
  }

/**

- Check if user has reached a usage limit
- @param {string} userPlan - User’s current plan
- @param {string} limitType - Type of limit (maxClients, maxTransactions, etc.)
- @param {number} currentUsage - Current usage count
- @returns {object} - { allowed: boolean, limit: number, remaining: number }
  */
  export function checkUsageLimit(userPlan, limitType, currentUsage) {
  const plan = PLAN_LIMITS[userPlan];
  if (!plan) {
  return { allowed: false, limit: 0, remaining: 0 };
  }

const limit = plan[limitType];

if (limit === Infinity) {
return { allowed: true, limit: Infinity, remaining: Infinity };
}

const remaining = Math.max(0, limit - currentUsage);
const allowed = currentUsage < limit;

return { allowed, limit, remaining };
}

/**

- Get all features available for a plan
- @param {string} userPlan - User’s current plan
- @returns {object} - Object with all feature flags
  */
  export function getPlanFeatures(userPlan) {
  return PLAN_LIMITS[userPlan] || PLAN_LIMITS[PLANS.FREE];
  }

/**

- Check if user can perform an action
- @param {object} user - User object with plan and usage stats
- @param {string} action - Action to check (uploadCSV, createReport, etc.)
- @returns {object} - { allowed: boolean, reason: string }
  */
  export function canPerformAction(user, action) {
  const plan = user.plan || PLANS.FREE;
  const features = getPlanFeatures(plan);

const actionChecks = {
uploadCSV: () => {
const limit = checkUsageLimit(plan, ‘csvUploads’, user.csvUploadsThisMonth || 0);
return {
allowed: limit.allowed,
reason: limit.allowed ? ‘’ : `Upload limit reached (${limit.limit} per month)`
};
},


createReport: () => {
  const limit = checkUsageLimit(plan, 'maxReports', user.reportsThisMonth || 0);
  return {
    allowed: limit.allowed,
    reason: limit.allowed ? '' : `Report limit reached (${limit.limit} per month)`
  };
},

addClient: () => {
  const limit = checkUsageLimit(plan, 'maxClients', user.clientCount || 0);
  return {
    allowed: limit.allowed,
    reason: limit.allowed ? '' : `Client limit reached (${limit.limit} clients)`
  };
},

generateForecast: () => ({
  allowed: features.forecasting,
  reason: features.forecasting ? '' : 'Forecasting not available on your plan'
}),

viewAIInsights: () => ({
  allowed: features.aiInsights,
  reason: features.aiInsights ? '' : 'AI Insights not available on your plan'
}),

exportPDF: () => ({
  allowed: features.exportPDF,
  reason: features.exportPDF ? '' : 'PDF export not available on your plan'
}),

accessClientPortal: () => ({
  allowed: features.clientPortal,
  reason: features.clientPortal ? '' : 'Client Portal not available on your plan'
}),

useAPI: () => ({
  allowed: features.apiAccess,
  reason: features.apiAccess ? '' : 'API access not available on your plan'
})


};

const check = actionChecks[action];
if (!check) {
return { allowed: false, reason: ‘Unknown action’ };
}

return check();
}

/**

- Get upgrade suggestions based on blocked action
- @param {string} currentPlan - User’s current plan
- @param {string} blockedAction - Action that was blocked
- @returns {array} - Array of plan recommendations
  */
  export function getUpgradeSuggestions(currentPlan, blockedAction) {
  const suggestions = [];

Object.entries(PLANS).forEach(([key, planName]) => {
if (planName === currentPlan) return;


const mockUser = { plan: planName };
const result = canPerformAction(mockUser, blockedAction);

if (result.allowed) {
  suggestions.push({
    plan: planName,
    features: getPlanFeatures(planName)
  });
}

});

return suggestions;
}
