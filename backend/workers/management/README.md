# Insight Hunter Workers Architecture

This document explains the complete backend architecture for Insight Hunter, showing how the Workers are organized, how they communicate, and how to work with this modular structure.

## Project Structure

```
insighthunter-v3/
├── workers/
│   ├── auth/                 # Authentication Worker
│   │   ├── index.js
│   │   └── package.json
│   │
│   ├── ingest/               # CSV Ingestion Worker
│   │   ├── index.js
│   │   ├── package.json
│   │   └── (additional modules as needed)
│   │
│   ├── analytics/            # Analytics & Forecasting Worker
│   │   ├── index.js          # Main entry point
│   │   ├── auth.js           # JWT verification
│   │   ├── data-aggregation.js  # Database queries
│   │   ├── forecasting.js    # Statistical forecasting
│   │   ├── seasonality.js    # Pattern detection
│   │   ├── insights.js       # AI insight generation
│   │   ├── anomalies.js      # Anomaly detection
│   │   ├── cache.js          # KV caching utilities
│   │   └── package.json
│   │
│   └── management/           # Client & User Management Worker
│       ├── index.js          # Main entry point
│       ├── auth.js           # JWT verification
│       ├── clients.js        # Client CRUD operations
│       ├── alerts.js         # Alert management
│       ├── users.js          # User profile management
│       ├── permissions.js    # Feature access control
│       └── package.json
│
├── shared/                   # Shared code across Workers
│   └── (common utilities)
│
├── database/                 # Database schemas and migrations
│   ├── schema.sql
│   └── migrations/
│
├── frontend/                 # React application
│   └── (React app structure)
│
├── wrangler.toml             # Cloudflare Workers configuration
└── package.json              # Root package.json
```

## Worker Responsibilities

### Analytics Worker (`/api/forecast`, `/api/insights`, `/api/dashboard`)

**Purpose**: Generate financial intelligence from transaction data

**Modules**:

- `forecasting.js` - Statistical prediction algorithms (linear regression, trend analysis)
- `seasonality.js` - Detect recurring patterns in financial data
- `insights.js` - AI-powered natural language explanations using Workers AI
- `anomalies.js` - Identify unusual transactions and spending spikes
- `data-aggregation.js` - Database queries for monthly summaries and breakdowns
- `cache.js` - Performance optimization through KV caching

**Key Features**:

- Revenue/expense/profit forecasting with confidence scores
- Seasonal pattern detection
- AI-generated insights that explain what the numbers mean
- Anomaly detection for unusual spending
- Smart caching for performance

### Management Worker (`/api/clients`, `/api/alerts`, `/api/user`)

**Purpose**: Handle CRUD operations for clients, alerts, and user profiles

**Modules**:

- `clients.js` - Client management for fractional CFOs (enterprise feature)
- `alerts.js` - Financial alerts and notifications
- `users.js` - User profile and settings
- `permissions.js` - Plan-based feature access control

**Key Features**:

- Client portal for managing multiple client accounts
- Alert management with severity levels
- User profile updates
- Feature gating based on subscription tier

## Modular Architecture Benefits

### 1. **Separation of Concerns**

Each module has a single, well-defined responsibility. If you need to update forecasting algorithms, you only modify `forecasting.js`. If you want to improve anomaly detection, you work in `anomalies.js`.

### 2. **Testability**

Modules can be tested independently. You can write unit tests for `forecasting.js` that don’t require database connections, authentication, or other infrastructure.

### 3. **Code Reusability**

The `auth.js` module is identical in both analytics and management Workers. You could extract this to the shared directory to avoid duplication.

### 4. **Team Collaboration**

Multiple developers can work on different modules simultaneously without merge conflicts. One person improves forecasting while another enhances anomaly detection.

### 5. **Maintainability**

When you need to find where specific functionality lives, the module organization makes it obvious. Bug in client creation? Check `clients.js`. Issue with caching? Look in `cache.js`.

## How Modules Work Together

### Example: Dashboard Data Flow

1. **Frontend Request**: User opens dashboard, React makes GET request to `/api/dashboard`
1. **Authentication** (`index.js` → `auth.js`):
- Main handler extracts JWT from Authorization header
- `authenticateRequest()` verifies token signature and expiration
- Returns user ID or null
1. **Caching Check** (`cache.js`):
- Generate cache key: `dashboard:${userId}:${clientId}`
- Check KV for cached result
- If found, return immediately (fast path)
1. **Data Aggregation** (`data-aggregation.js`):
- If cache miss, query D1 database
- `getMonthlyData()` fetches revenue/expense trends
- `getCategoryBreakdown()` gets expense distribution
1. **Forecasting** (`forecasting.js`):
- `generateForecast()` runs linear regression on historical data
- Calculates confidence scores based on data consistency
- Returns predictions for next 3 months
1. **Response Assembly** (`index.js`):
- Combine all data into dashboard object
- Calculate KPIs (revenue, expenses, profit, margins)
- Store result in KV cache
- Return JSON response to frontend

## Development Workflow

### Running Locally

```bash
# Run analytics Worker in dev mode
cd workers/analytics
npx wrangler dev

# In another terminal, run management Worker
cd workers/management
npx wrangler dev --port 8788

# Run frontend (in another terminal)
cd frontend
npm run dev
```

### Deploying

```bash
# Deploy all Workers from repository root
npx wrangler deploy

# Or deploy specific Worker
npx wrangler deploy --name insighthunter-analytics
```

### Adding New Functionality

To add a new feature, follow this pattern:

1. **Create new module** (if needed): `workers/analytics/my-feature.js`
1. **Export functions**: Make your functions available for import
1. **Import in index.js**: `import { myFunction } from './my-feature.js'`
1. **Add route handler**: Create handler function that uses your module
1. **Update routes**: Add new endpoint to `wrangler.toml`

## Configuration

All Workers are configured in the root `wrangler.toml` file:

```toml
# Example for Analytics Worker
[[services]]
name = "insighthunter-analytics"
main = "workers/analytics/index.js"
compatibility_date = "2024-01-01"

routes = [
  { pattern = "api.insighthunter.app/api/forecast/*", zone_name = "insighthunter.app" },
  { pattern = "api.insighthunter.app/api/insights/*", zone_name = "insighthunter.app" },
  { pattern = "api.insighthunter.app/api/dashboard/*", zone_name = "insighthunter.app" }
]

[[services.d1_databases]]
binding = "DB"
database_name = "insighthunter-production"
database_id = "your-database-id"

[[services.kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[services.ai]]
binding = "AI"
```

## Best Practices

### 1. **Keep Modules Focused**

Each module should do one thing well. If a module grows beyond 300-400 lines, consider splitting it.

### 2. **Document Function Parameters**

Use JSDoc comments to document what each function expects and returns:

```javascript
/**
 * Generate forecast for a metric
 * @param {Array} historicalData - Array of monthly data objects
 * @param {number} periodsAhead - Number of periods to forecast
 * @param {string} metric - Metric to forecast ('revenue', 'expenses', 'profit')
 * @returns {Object} Forecast result with predictions and confidence
 */
export function generateForecast(historicalData, periodsAhead, metric) {
  // Implementation
}
```

### 3. **Error Handling**

Always handle errors gracefully. Don’t let one module’s failure crash the entire Worker:

```javascript
try {
  const forecast = await generateForecast(data);
  return forecast;
} catch (error) {
  console.error('Forecasting error:', error);
  return { forecasts: [], confidence: 0, error: error.message };
}
```

### 4. **Consistent Response Formats**

All endpoints return JSON with a consistent structure:

```javascript
// Success
{ "success": true, "data": {...} }

// Error
{ "error": "Error message", "details": {...} }
```

### 5. **Cache Strategically**

Use KV caching for expensive operations that don’t change frequently:

- Dashboard data: 15 minutes
- Forecasts: 30 minutes
- AI insights: 1 hour

## Testing Strategy

### Unit Tests

Test individual modules in isolation:

```javascript
// forecasting.test.js
import { generateForecast } from './forecasting.js';

const testData = [/* sample data */];
const result = generateForecast(testData, 3, 'revenue');

assert(result.forecasts.length === 3);
assert(result.confidence > 0 && result.confidence <= 1);
```

### Integration Tests

Test how modules work together by calling the main handler functions.

### End-to-End Tests

Test complete flows from frontend through Workers to database and back.

## Troubleshooting

### Module Import Errors

If you see “Cannot find module”, ensure:

- File paths in imports are correct
- Files have `.js` extension in imports
- `package.json` has `"type": "module"`

### Wrangler Bundling Issues

If deployment fails, check:

- All imported files exist
- No circular dependencies between modules
- External dependencies are in `package.json`

### Performance Issues

If Workers are slow:

- Check if caching is working properly
- Look for expensive database queries
- Verify AI calls are being cached
- Use `console.log` to time operations

## Next Steps

1. **Add Tests**: Implement unit tests for each module
1. **Optimize Queries**: Add database indexes for common query patterns
1. **Enhance Caching**: Implement cache invalidation when data changes
1. **Add Logging**: Implement structured logging for debugging
1. **Monitor Performance**: Track Worker execution times and errors

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Vectorize Docs](https://developers.cloudflare.com/vectorize/)

-----

For questions or issues, refer to the specific module README files or reach out to the development team.
