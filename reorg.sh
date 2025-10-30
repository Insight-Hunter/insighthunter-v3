#!/bin/bash

# Insight Hunter v3 - Structure Migration Script
# This script reorganizes the file structure to align with best practices
# Run from the root of insighthunter-v3 repository

set -e  # Exit on error

echo "🚀 Starting Insight Hunter v3 Structure Migration..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup
echo "📦 Creating backup..."
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r backend frontend shared "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"
echo ""

# ============================================
# PHASE 1: Frontend Cleanup
# ============================================

echo "📱 Phase 1: Frontend Structure Cleanup"
echo "----------------------------------------"

# 1. Fix component nesting issue
echo "1️⃣  Fixing component nesting..."
if [ -d "frontend/src/components/components" ]; then
    mkdir -p frontend/src/components/common
    cp -r frontend/src/components/components/* frontend/src/components/common/ 2>/dev/null || true
    rm -rf frontend/src/components/components
    echo -e "${GREEN}✓ Moved nested components to common/${NC}"
else
    echo -e "${YELLOW}⊘ No nested components directory found${NC}"
fi

# 2. Create missing component directories
echo "2️⃣  Creating missing component directories..."
mkdir -p frontend/src/components/{forecast,reports,analytics,upload,settings}
echo -e "${GREEN}✓ Created: forecast, reports, analytics, upload, settings${NC}"

# 3. Reorganize existing components
echo "3️⃣  Reorganizing existing components..."

# Move Dashboard components if not already organized
if [ -d "frontend/src/components/Dashboard" ]; then
    mkdir -p frontend/src/components/dashboard
    cp -r frontend/src/components/Dashboard/* frontend/src/components/dashboard/ 2>/dev/null || true
    # Keep original for safety, can delete manually after verification
fi

# Move Charts to charts (lowercase for consistency)
if [ -d "frontend/src/components/Charts" ]; then
    mkdir -p frontend/src/components/charts
    cp -r frontend/src/components/Charts/* frontend/src/components/charts/ 2>/dev/null || true
fi

# Move Layout components
if [ -d "frontend/src/components/Layout" ]; then
    mkdir -p frontend/src/components/layout
    cp -r frontend/src/components/Layout/* frontend/src/components/layout/ 2>/dev/null || true
fi

# Move UI components to common
if [ -d "frontend/src/components/UI" ]; then
    mkdir -p frontend/src/components/common
    cp -r frontend/src/components/UI/* frontend/src/components/common/ 2>/dev/null || true
fi

echo -e "${GREEN}✓ Components reorganized${NC}"

# 4. Create lib directory structure
echo "4️⃣  Creating frontend lib directory..."
mkdir -p frontend/src/lib/{api,calculations,formatters,constants}

# Create placeholder files
cat > frontend/src/lib/api/client.ts << 'EOF'
// API Client Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
EOF

echo -e "${GREEN}✓ Created lib structure with API client${NC}"

# 5. Reorganize pages
echo "5️⃣  Reorganizing pages structure..."
mkdir -p frontend/src/pages/Forecast

# Move ForecastPage from Analytics to Forecast
if [ -f "frontend/src/pages/Analytics/ForecastPage.tsx" ]; then
    mv frontend/src/pages/Analytics/ForecastPage.tsx frontend/src/pages/Forecast/
    echo -e "${GREEN}✓ Moved ForecastPage to Forecast directory${NC}"
else
    echo -e "${YELLOW}⊘ ForecastPage.tsx not found in Analytics${NC}"
fi

echo ""

# ============================================
# PHASE 2: Backend Expansion
# ============================================

echo "⚙️  Phase 2: Backend Structure Expansion"
echo "----------------------------------------"

# 1. Add missing route files
echo "1️⃣  Creating missing route files..."
touch backend/src/routes/{dashboard,forecast,reports,analytics,transactions,users}.ts
echo -e "${GREEN}✓ Created 6 new route files${NC}"

# 2. Add missing service files
echo "2️⃣  Creating missing service files..."
touch backend/src/services/{dashboardServices,forecastServices,reportServices,analyticsServices,transactionServices,userServices}.ts
echo -e "${GREEN}✓ Created 6 new service files${NC}"

# 3. Create AI directory and move files
echo "3️⃣  Creating AI directory structure..."
mkdir -p backend/src/ai

# Move existing AI files
if [ -f "backend/utils/ai-insights.js" ]; then
    cp backend/utils/ai-insights.js backend/src/ai/insights-generator.ts
    echo -e "${GREEN}✓ Copied ai-insights.js to ai/insights-generator.ts${NC}"
fi

if [ -f "backend/utils/ml-forecasting.js" ]; then
    cp backend/utils/ml-forecasting.js backend/src/ai/forecasting-engine.ts
    echo -e "${GREEN}✓ Copied ml-forecasting.js to ai/forecasting-engine.ts${NC}"
fi

# Create additional AI files
touch backend/src/ai/{anomaly-detection,categorization,recommendation-engine}.ts
echo -e "${GREEN}✓ Created additional AI module files${NC}"

# 4. Create new workers
echo "4️⃣  Creating new Cloudflare Workers..."

# Reports worker
mkdir -p backend/workers/reports
cat > backend/workers/reports/wrangler.toml << 'EOF'
name = "insighthunter-reports"
main = "index.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.development]
vars = { ENVIRONMENT = "development" }
EOF

touch backend/workers/reports/{index.js,pdf-generator.js,excel-generator.js}
echo -e "${GREEN}✓ Created reports worker${NC}"

# Scheduled worker
mkdir -p backend/workers/scheduled
cat > backend/workers/scheduled/wrangler.toml << 'EOF'
name = "insighthunter-scheduled"
main = "index.js"
compatibility_date = "2024-01-01"

[triggers]
crons = ["0 9 * * *"]  # Daily at 9 AM UTC

[env.production]
vars = { ENVIRONMENT = "production" }
EOF

touch backend/workers/scheduled/{index.js,alerts.js,notifications.js,weekly-reports.js}
echo -e "${GREEN}✓ Created scheduled worker${NC}"

# 5. Organize database schemas
echo "5️⃣  Creating database schema documentation..."
mkdir -p backend/database/schema
touch backend/database/schema/{users,transactions,forecasts,reports,clients,alerts}.sql
echo -e "${GREEN}✓ Created schema documentation files${NC}"

echo ""

# ============================================
# PHASE 3: Shared Types Reorganization
# ============================================

echo "📝 Phase 3: Types Reorganization"
echo "----------------------------------------"

echo "1️⃣  Creating types directory structure..."
mkdir -p shared/types

# Create individual type files
cat > shared/types/index.ts << 'EOF'
// Central export for all types
export * from './auth';
export * from './dashboard';
export * from './forecast';
export * from './reports';
export * from './transactions';
export * from './api';
EOF

touch shared/types/{auth,dashboard,forecast,reports,transactions,api}.ts

echo -e "${GREEN}✓ Created types structure${NC}"

# Note about migrating existing types
if [ -f "shared/types.ts" ]; then
    echo -e "${YELLOW}⚠ Note: shared/types.ts still exists. You'll need to manually split its contents.${NC}"
    echo "  Suggested approach:"
    echo "    1. Review shared/types.ts"
    echo "    2. Copy relevant types to appropriate files in shared/types/"
    echo "    3. Update imports across the codebase"
    echo "    4. Delete shared/types.ts when complete"
fi

echo ""

# ============================================
# PHASE 4: Summary & Next Steps
# ============================================

echo "✅ Migration Complete!"
echo "====================="
echo ""
echo "Summary of changes:"
echo "  📱 Frontend:"
echo "    - Fixed component nesting"
echo "    - Created missing component directories"
echo "    - Added lib/ directory structure"
echo "    - Reorganized pages"
echo ""
echo "  ⚙️  Backend:"
echo "    - Added 6 new route files"
echo "    - Added 6 new service files"
echo "    - Created AI directory"
echo "    - Added 2 new workers (reports, scheduled)"
echo "    - Created database schema docs"
echo ""
echo "  📝 Shared:"
echo "    - Created organized types structure"
echo ""
echo "📋 Manual Steps Required:"
echo "  1. Review and test the reorganized components"
echo "  2. Update import statements in affected files"
echo "  3. Split content from shared/types.ts into new type files"
echo "  4. Implement template code in new route/service files"
echo "  5. Delete old capitalized component directories after verification"
echo "  6. Test all features to ensure nothing broke"
echo ""
echo "📦 Backup Location: $BACKUP_DIR"
echo ""
echo -e "${GREEN}🎉 Structure migration successful!${NC}"
echo ""
echo "Next: Run 'npm install' in backend and frontend if needed"
echo "Then: See MIGRATION_GUIDE.md for implementation details"
