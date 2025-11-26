#!/bin/bash

# FlowPulse Netlify Deployment Script
# Deploys the dashboard to Netlify

set -e

echo "🚀 Deploying FlowPulse Dashboard to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify authentication..."
netlify status || netlify login

# Deploy to production
echo "📤 Deploying to production..."
netlify deploy --prod --dir=dashboard/dist --build

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  Important: Update Supabase Auth URLs"
echo "1. Get your site URL from Netlify dashboard"
echo "2. Go to: https://supabase.com/dashboard/project/glaxxuhfksarxauufyco/auth/url-configuration"
echo "3. Set Site URL to your Netlify URL"
echo "4. Add Redirect URL: https://your-site.netlify.app/**"
