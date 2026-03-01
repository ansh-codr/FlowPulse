#!/bin/bash
set -e

echo "🚀 FlowPulse Schema Deployment"
echo "================================"

SUPABASE_URL="https://glaxxuhfksarxauufyco.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYXh4dWhma3NhcnhhdXVmeWNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE1OTI4MiwiZXhwIjoyMDc5NzM1MjgyfQ.Pk5VT7Jg8E9wQBEzPYvHHAYV8CqNXZ8JF6pGr-xqOgs"

echo ""
echo "📋 Applying schema migrations..."

# Read and combine all SQL files
SQL_CONTENT=$(cat supabase/sql/001_schema.sql supabase/sql/002_policies.sql supabase/sql/003_functions.sql)

# Execute SQL via Supabase REST API
response=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

# Alternative: use psql with direct connection
echo ""
echo "Applying SQL migrations directly..."

# Schema
echo "  ✓ Creating tables..."
psql "postgresql://postgres:Bqb8lNFgDHrb7ks0@db.glaxxuhfksarxauufyco.supabase.co:5432/postgres" \
  < supabase/sql/001_schema.sql 2>&1 | grep -v "already exists" || true

# Policies
echo "  ✓ Setting up RLS policies..."
psql "postgresql://postgres:Bqb8lNFgDHrb7ks0@db.glaxxuhfksarxauufyco.supabase.co:5432/postgres" \
  < supabase/sql/002_policies.sql 2>&1 | grep -v "already exists" || true

# Functions
echo "  ✓ Creating helper functions..."
psql "postgresql://postgres:Bqb8lNFgDHrb7ks0@db.glaxxuhfksarxauufyco.supabase.co:5432/postgres" \
  < supabase/sql/003_functions.sql 2>&1 | grep -v "already exists" || true

echo ""
echo "✅ Schema deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Go to Supabase Dashboard → Authentication → URL Configuration"
echo "  2. Add http://localhost:5173 to Site URL and Redirect URLs"
echo "  3. Run: cd extension && npm run build"
echo "  4. Load extension/dist in chrome://extensions"
echo "  5. Run: cd dashboard && npm run dev"
echo "  6. Open http://localhost:5173 and sign in"
