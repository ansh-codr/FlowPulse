#!/bin/bash

# 🚀 FlowPulse Quick Deploy Script
# Deploys everything needed to get FlowPulse running online

set -e

echo "🌊⚡ FlowPulse Deployment Wizard"
echo "================================"
echo ""

# Check for required tools
echo "📋 Checking prerequisites..."

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ git not found. Please install git first."
    exit 1
fi

echo "✅ Prerequisites met!"
echo ""

# Step 1: Build Dashboard
echo "📦 Step 1/4: Building Dashboard..."
cd dashboard
npm install
npm run build
cd ..
echo "✅ Dashboard built successfully!"
echo ""

# Step 2: Build & Package Extension
echo "📦 Step 2/4: Building Extension..."
cd extension
npm install
npm run zip
cd ..
echo "✅ Extension packaged: extension/flowpulse-extension.zip"
echo ""

# Step 3: Check Netlify CLI
echo "🌐 Step 3/4: Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo "📥 Installing Netlify CLI..."
    npm install -g netlify-cli
fi
echo "✅ Netlify CLI ready!"
echo ""

# Step 4: Instructions
echo "🎉 Step 4/4: Ready to Deploy!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📱 EXTENSION DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════"
echo "1. Go to: https://chrome.google.com/webstore/devconsole"
echo "2. Click 'New Item'"
echo "3. Upload: extension/flowpulse-extension.zip"
echo "4. Fill in metadata and submit for review"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🌐 DASHBOARD DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════"
echo "Choose one option:"
echo ""
echo "Option A - Netlify UI (Recommended):"
echo "  1. Push this repo to GitHub"
echo "  2. Go to: https://app.netlify.com"
echo "  3. Click 'Add new site' → 'Import existing project'"
echo "  4. Select your GitHub repo"
echo "  5. Add environment variables:"
echo "     VITE_SUPABASE_URL=https://glaxxuhfksarxauufyco.supabase.co"
echo "     VITE_SUPABASE_ANON_KEY=<your-anon-key>"
echo "  6. Deploy!"
echo ""
echo "Option B - Netlify CLI:"
echo "  Run: netlify deploy --prod"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🗄️  DATABASE SETUP (REQUIRED)"
echo "═══════════════════════════════════════════════════════════"
echo "1. Go to: https://supabase.com/dashboard/project/glaxxuhfksarxauufyco/sql/new"
echo "2. Copy and run: supabase/sql/001_schema.sql"
echo "3. Copy and run: supabase/sql/002_policies.sql"
echo "4. Copy and run: supabase/sql/003_functions.sql"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔐 AUTH CONFIGURATION (REQUIRED)"
echo "═══════════════════════════════════════════════════════════"
echo "After deploying dashboard, update Auth URLs:"
echo "1. Go to: https://supabase.com/dashboard/project/glaxxuhfksarxauufyco/auth/url-configuration"
echo "2. Set Site URL: https://your-site.netlify.app"
echo "3. Add Redirect URL: https://your-site.netlify.app/**"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT.md"
echo ""
echo "✨ Happy tracking! 🌊⚡"
