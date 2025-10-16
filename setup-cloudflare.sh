
#!/bin/bash

# Insight Hunter v3 - Cloudflare Setup Script
# Automates creation of D1, KV, R2, Vectorize resources

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "============================================"
echo "   Insight Hunter v3 - Cloudflare Setup    "
echo "   AI-Powered Auto-CFO Platform            "
echo "============================================"
echo -e "${NC}"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}ERROR: Wrangler CLI not found${NC}"
    echo -e "${YELLOW}Install with: npm install -g wrangler${NC}"
    exit 1
fi

echo -e "${GREEN}SUCCESS: Wrangler CLI found${NC}"

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Cloudflare first${NC}"
    wrangler login
fi

echo -e "${GREEN}SUCCESS: Logged in to Cloudflare${NC}"
echo ""

# Create D1 Database
echo -e "${BLUE}Creating D1 Database...${NC}"
D1_OUTPUT=$(wrangler d1 create insighthunter 2>&1 || true)

if echo "$D1_OUTPUT" | grep -q "already exists"; then
    echo -e "${YELLOW}WARNING: D1 database 'insighthunter' already exists${NC}"
    D1_ID=$(wrangler d1 list | grep insighthunter | awk '{print $2}')
else
    D1_ID=$(echo "$D1_OUTPUT" | grep "database_id" | sed -n 's/.*database_id = "\([^"]*\)".*/\1/p')
    echo -e "${GREEN}SUCCESS: D1 Database created${NC}"
fi

echo -e "${BLUE}Database ID: ${D1_ID}${NC}"
echo ""

# Create KV Namespace
echo -e "${BLUE}Creating KV Namespace...${NC}"
KV_OUTPUT=$(wrangler kv:namespace create "SESSIONS" 2>&1 || true)

if echo "$KV_OUTPUT" | grep -q "already exists"; then
    echo -e "${YELLOW}WARNING: KV namespace already exists${NC}"
    KV_ID=$(wrangler kv:namespace list | grep SESSIONS | awk '{print $2}')
else
    KV_ID=$(echo "$KV_OUTPUT" | grep "id" | sed -n 's/.*id = "\([^"]*\)".*/\1/p')
    echo -e "${GREEN}SUCCESS: KV Namespace created${NC}"
fi

echo -e "${BLUE}KV ID: ${KV_ID}${NC}"
echo ""

# Create R2 Bucket
echo -e "${BLUE}Creating R2 Bucket...${NC}"
R2_OUTPUT=$(wrangler r2 bucket create insighthunter-files 2>&1 || true)

if echo "$R2_OUTPUT" | grep -q "already exists"; then
    echo -e "${YELLOW}WARNING: R2 bucket 'insighthunter-files' already exists${NC}"
else
    echo -e "${GREEN}SUCCESS: R2 Bucket created${NC}"
fi
echo ""

# Create Vectorize Index
echo -e "${BLUE}Creating Vectorize Index...${NC}"
VECTORIZE_OUTPUT=$(wrangler vectorize create transaction-search \
    --dimensions=768 \
    --metric=cosine 2>&1 || true)

if echo "$VECTORIZE_OUTPUT" | grep -q "already exists"; then
    echo -e "${YELLOW}WARNING: Vectorize index 'transaction-search' already exists${NC}"
else
    echo -e "${GREEN}SUCCESS: Vectorize Index created${NC}"
fi
echo ""

# Apply database schema
echo -e "${BLUE}Applying database schema...${NC}"
if [ -f "database/d1-schema.sql" ]; then
    wrangler d1 execute insighthunter --file=database/d1-schema.sql
    echo -e "${GREEN}SUCCESS: Database schema applied${NC}"
else
    echo -e "${YELLOW}WARNING: Schema file not found: database/d1-schema.sql${NC}"
    echo -e "${YELLOW}Apply manually with: wrangler d1 execute insighthunter --file=database/d1-schema.sql${NC}"
fi
echo ""

# Update all worker wrangler.toml files
echo -e "${BLUE}Updating worker configurations...${NC}"

WORKERS=("auth" "ingest" "analytics" "management")

for worker in "${WORKERS[@]}"; do
    WRANGLER_FILE="workers/${worker}/wrangler.toml"
    
    if [ -f "$WRANGLER_FILE" ]; then
        # Create backup
        cp "$WRANGLER_FILE" "${WRANGLER_FILE}.backup"
        
        # Update D1 database ID
        sed -i.tmp "s/database_id = \"your-d1-database-id\"/database_id = \"${D1_ID}\"/" "$WRANGLER_FILE"
        
        # Update KV namespace ID
        sed -i.tmp "s/id = \"your-kv-namespace-id\"/id = \"${KV_ID}\"/" "$WRANGLER_FILE"
        
        # Clean up temp files
        rm -f "${WRANGLER_FILE}.tmp"
        
        echo -e "${GREEN}  ✓ Updated: ${WRANGLER_FILE}${NC}"
    else
        echo -e "${YELLOW}  ⚠ Not found: ${WRANGLER_FILE}${NC}"
    fi
done

echo -e "${GREEN}SUCCESS: All wrangler.toml files updated${NC}"
echo ""

# Summary
echo -e "${GREEN}"
echo "============================================"
echo "          Setup Complete!                  "
echo "============================================"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Resource Summary:${NC}"
echo -e "   D1 Database: ${GREEN}insighthunter${NC} (${D1_ID})"
echo -e "   KV Namespace: ${GREEN}SESSIONS${NC} (${KV_ID})"
echo -e "   R2 Bucket: ${GREEN}insighthunter-files${NC}"
echo -e "   Vectorize Index: ${GREEN}transaction-search${NC}"
echo ""

# Save configuration
cat > cloudflare-config.txt << EOF
# Cloudflare Resources Configuration
# Generated: $(date)

D1_DATABASE_ID=${D1_ID}
KV_NAMESPACE_ID=${KV_ID}
R2_BUCKET_NAME=insighthunter-files
VECTORIZE_INDEX=transaction-search

# Add these to your wrangler.toml:

[[d1_databases]]
binding = "DB"
database_name = "insighthunter"
database_id = "${D1_ID}"

[[kv_namespaces]]
binding = "KV"
id = "${KV_ID}"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "insighthunter-files"

[[vectorize]]
binding = "VECTORIZE"
index_name = "transaction-search"

[ai]
binding = "AI"
EOF

echo -e "${GREEN}SUCCESS: Configuration saved to: cloudflare-config.txt${NC}"
echo ""

# Next steps
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo -e "1. ${BLUE}Verify configuration:${NC}"
echo "   cat cloudflare-config.txt"
echo ""
echo -e "2. ${BLUE}Deploy workers:${NC}"
echo "   cd workers/auth && wrangler deploy"
echo "   cd workers/ingest && wrangler deploy"
echo "   cd workers/analytics && wrangler deploy"
echo "   cd workers/management && wrangler deploy"
echo ""
echo -e "3. ${BLUE}Test locally:${NC}"
echo "   cd workers/auth && wrangler dev --local --persist"
echo ""
echo -e "4. ${BLUE}Deploy frontend:${NC}"
echo "   cd frontend && npm run build"
echo "   wrangler pages deploy dist --project-name insighthunter"
echo ""
echo -e "${GREEN}Happy building!${NC}"
echo ""

# Optional: Test D1 connection
echo -e "${BLUE}Testing D1 connection...${NC}"
TEST_RESULT=$(wrangler d1 execute insighthunter --command="SELECT name FROM sqlite_master WHERE type='table' LIMIT 5" 2>&1 || true)

if echo "$TEST_RESULT" | grep -q "users"; then
    echo -e "${GREEN}SUCCESS: D1 connection successful - tables detected${NC}"
else
    echo -e "${YELLOW}WARNING: Could not verify tables. You may need to apply the schema manually.${NC}"
fi
echo ""

# Show account info
echo -e "${BLUE}Account Info:${NC}"
wrangler whoami
echo ""

echo -e "${GREEN}All done! Check cloudflare-config.txt for your resource IDs${NC}"
