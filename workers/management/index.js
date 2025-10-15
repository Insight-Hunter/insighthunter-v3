import { authenticateRequest } from "./auth.js";

import {
getClients,
getClient,
createClient,
updateClient,
deleteClient,
searchClients
} from "./clients.js";

import {
getAlerts,
createAlert,
markAlertRead,
markAllAlertsRead,
dismissAlert,
getAlertStats
} from "./alerts.js";

import {
getUserProfile,
updateUserProfile,
getUserActivity
} from "./users.js";

import {
getUserPlan,
checkUsageLimit,
hasFeatureAccess
} from "./permissions.js";

/**

- CORS headers for cross-origin requests
  */
  const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

/**

- Handle CORS preflight requests
  */
  function handleOptions() {
  return new Response(null, {
  headers: CORS_HEADERS
  });
  }

/**

- Create error response
  */
  function errorResponse(message, status = 500, details = null) {
  const body = details
  ? { error: message, details }
  : { error: message };

return new Response(JSON.stringify(body), {
status,
headers: {
"Content-Type": "application/json",
…CORS_HEADERS
}
});
}

/**

- Create success response
  */
  function successResponse(data, status = 200) {
  return new Response(JSON.stringify({ success: true, …data }), {
  status,
  headers: {
  "Content-Type": "application/json",
…CORS_HEADERS
}
}
  }
  });
  }

/**

- Handle client endpoints
  */
  async function handleClients(request, env, userId, pathname) {
  const url = new URL(request.url);

// GET /api/clients - List all clients
if (pathname === "/api/clients" && request.method === "GET") {
// Check if user has access to client portal
const userPlan = await getUserPlan(env.DB, userId);

```
if (!hasFeatureAccess(userPlan.planType, 'maxClients') || userPlan.features.maxClients === 0) {
  return errorResponse(
    'Client portal is only available on Enterprise plan',
    403,
    { currentPlan: userPlan.planType, upgradeRequired: 'enterprise' }
  );
}

const searchQuery = url.searchParams.get('search');

const clients = searchQuery
  ? await searchClients(env.DB, userId, searchQuery)
  : await getClients(env.DB, userId);

return successResponse({ clients });
```

}

// POST /api/clients - Create new client
if (pathname === "/api/clients" && request.method === "POST") {
const userPlan = await getUserPlan(env.DB, userId);

```
// Check client limit
const limitCheck = await checkUsageLimit(env.DB, userId, userPlan.planType, 'maxClients');

if (!limitCheck.allowed) {
  return errorResponse(
    limitCheck.reason,
    403,
    {
      currentPlan: userPlan.planType,
      upgradeRequired: limitCheck.upgradeRequired,
      current: limitCheck.current,
      max: limitCheck.max
    }
  );
}

const clientData = await request.json();
const client = await createClient(env.DB, userId, clientData);

return successResponse({ client }, 201);
```

}

// GET /api/clients/:id - Get specific client
const clientIdMatch = pathname.match(/^/api/clients/(\d+)$/);
if (clientIdMatch && request.method === "GET") {
const clientId = parseInt(clientIdMatch[1]);
const client = await getClient(env.DB, clientId, userId);

```
if (!client) {
  return errorResponse('Client not found', 404);
}

return successResponse({ client });
```

}

// PUT /api/clients/:id - Update client
if (clientIdMatch && request.method === "PUT") {
const clientId = parseInt(clientIdMatch[1]);
const updates = await request.json();

```
const client = await updateClient(env.DB, clientId, userId, updates);
return successResponse({ client });
```

}

// DELETE /api/clients/:id - Delete client
if (clientIdMatch && request.method === "DELETE") {
const clientId = parseInt(clientIdMatch[1]);
await deleteClient(env.DB, clientId, userId);

```
return successResponse({ message: 'Client archived successfully' });
```

}

return errorResponse("Not found", 404);
}

/**

- Handle alert endpoints
  */
  async function handleAlerts(request, env, userId, pathname) {
  const url = new URL(request.url);

// GET /api/alerts - List alerts
if (pathname === "/api/alerts" && request.method === "GET") {
const clientId = url.searchParams.get("client_id");
const includeRead = url.searchParams.get("include_read") === "true";
const severity = url.searchParams.get("severity");

```
const alerts = await getAlerts(env.DB, userId, clientId, {
  includeRead,
  severity,
  limit: 100
});

return successResponse({ alerts });
```

}

// GET /api/alerts/stats - Get alert statistics
if (pathname === "/api/alerts/stats" && request.method === "GET") {
const clientId = url.searchParams.get("client_id");
const stats = await getAlertStats(env.DB, userId, clientId);

```
return successResponse({ stats });
```

}

// POST /api/alerts - Create new alert (for system-generated alerts)
if (pathname === "/api/alerts" && request.method === "POST") {
const alertData = await request.json();
const alert = await createAlert(env.DB, userId, alertData);

```
return successResponse({ alert }, 201);
```

}

// POST /api/alerts/:id/read - Mark alert as read
const readMatch = pathname.match(/^/api/alerts/(\d+)/read$/);
if (readMatch && request.method === "POST") {
const alertId = parseInt(readMatch[1]);
await markAlertRead(env.DB, alertId, userId);

```
return successResponse({ message: 'Alert marked as read' });
```

}

// POST /api/alerts/read-all - Mark all alerts as read
if (pathname === "/api/alerts/read-all" && request.method === "POST") {
const { client_id } = await request.json().catch(() => ({}));
const count = await markAllAlertsRead(env.DB, userId, client_id);

```
return successResponse({ message: `${count} alerts marked as read`, count });
```

}

// POST /api/alerts/:id/dismiss - Dismiss alert
const dismissMatch = pathname.match(/^/api/alerts/(\d+)/dismiss$/);
if (dismissMatch && request.method === "POST") {
const alertId = parseInt(dismissMatch[1]);
await dismissAlert(env.DB, alertId, userId);

```
return successResponse({ message: 'Alert dismissed' });
```

}

return errorResponse("Not found", 404);
}

/**

- Handle user profile endpoints
  */
  async function handleUser(request, env, userId, pathname) {
  // GET /api/user/profile - Get user profile
  if (pathname === "/api/user/profile" && request.method === "GET") {
  const profile = await getUserProfile(env.DB, userId);
  
  if (!profile) {
  return errorResponse("User not found", 404);
  }
  
  return successResponse({ profile });
  }

// PUT /api/user/profile - Update user profile
if (pathname === "/api/user/profile" && request.method === "PUT") {
const updates = await request.json();
const profile = await updateUserProfile(env.DB, userId, updates);

```
return successResponse({ profile });
```

}

// GET /api/user/plan - Get user plan details
if (pathname === "/api/user/plan" && request.method === "GET") {
const plan = await getUserPlan(env.DB, userId);

```
if (!plan) {
  return errorResponse('User not found', 404);
}

return successResponse({ 
  planType: plan.planType,
  isExpired: plan.isExpired,
  expiresAt: plan.expiresAt,
  features: plan.features
});
```

}

// GET /api/user/activity - Get user activity history
if (pathname === "/api/user/activity" && request.method === "GET") {
const url = new URL(request.url);
const limit = parseInt(url.searchParams.get("limit") || "20");

```
const activity = await getUserActivity(env.DB, userId, limit);

return successResponse({ activity });
```

}

return errorResponse("Not found", 404);
}

/**

- Main Worker fetch handler
  */
  export default {
  async fetch(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
  return handleOptions();
  }
  
  // Authenticate all requests
  const payload = await authenticateRequest(request, env.JWT_SECRET);
  
  if (!payload) {
  return errorResponse("Authentication required", 401);
  }
  
  const userId = payload.userId;
  
  try {
  // Route to appropriate handler based on path
  if (pathname.startsWith("/api/clients")) {
  return await handleClients(request, env, userId, pathname);
  }
  
  if (pathname.startsWith("/api/alerts")) {
  return await handleAlerts(request, env, userId, pathname);
  }
  
  if (pathname.startsWith("/api/user")) {
  return await handleUser(request, env, userId, pathname);
  }
  
  // No matching route
  return errorResponse("Not found", 404);
  
  } catch (error) {
  console.error("Worker error:", error);
  return errorResponse("Internal server error: " + error.message, 500);
  }
  }
  };
