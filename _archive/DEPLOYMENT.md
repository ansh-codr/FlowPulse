# FlowPulse Deployment Guide

## 🚀 Quick Start

### 1. Deploy Dashboard to Netlify

#### Option A: Deploy via Netlify UI (Recommended)
1. Push this repo to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your FlowPulse repository
5. Netlify will auto-detect the `netlify.toml` configuration
6. Add environment variables:
   - `VITE_SUPABASE_URL`: `https://glaxxuhfksarxauufyco.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYXh4dWhma3NhcnhhdXVmeWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTkyODIsImV4cCI6MjA3OTczNTI4Mn0.0q6hFNgm2oBIORj07v9XcySa5IBRcHS8X5DVFhFvsOw`
7. Click "Deploy site"

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (from project root)
netlify deploy --prod

# Follow prompts and select:
# - Build command: cd dashboard && npm install && npm run build
# - Publish directory: dashboard/dist
```

### 2. Update Supabase Auth URLs

After deploying to Netlify, you'll get a URL like: `https://your-site.netlify.app`

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/glaxxuhfksarxauufyco/auth/url-configuration)
2. Update these settings:
   - **Site URL**: `https://your-site.netlify.app`
   - **Redirect URLs**: Add `https://your-site.netlify.app/**`

### 3. Package Extension for Chrome Web Store

```bash
# From project root
cd extension
npm run build

# Create a ZIP file
cd dist
zip -r ../flowpulse-extension.zip .
cd ..
```

This creates `extension/flowpulse-extension.zip` ready for Chrome Web Store submission.

### 4. Update Extension Configuration

Update `extension/.env` with your production dashboard URL:
```env
VITE_SUPABASE_URL=https://glaxxuhfksarxauufyco.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYXh4dWhma3NhcnhhdXVmeWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTkyODIsImV4cCI6MjA3OTczNTI4Mn0.0q6hFNgm2oBIORj07v9XcySa5IBRcHS8X5DVFhFvsOw
VITE_SUPABASE_FUNCTION_URL=https://glaxxuhfksarxauufyco.functions.supabase.co/events-ingest
```

Rebuild after updating:
```bash
npm run build
```

### 5. Publish to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer registration fee (if not already registered)
3. Click "New Item" and upload `flowpulse-extension.zip`
4. Fill in required information:
   - **Name**: FlowPulse Tracker
   - **Description**: Track your browser activity and boost productivity with real-time insights
   - **Category**: Productivity
   - **Screenshots**: Take screenshots of the popup and dashboard
   - **Privacy Policy**: Include if collecting user data
5. Submit for review (typically takes 1-3 days)

---

## 🧪 Testing Before Deployment

### Test Dashboard Locally
```bash
cd dashboard
npm run dev
# Visit http://localhost:5174
```

### Test Extension Locally
```bash
cd extension
npm run build
# Load unpacked from chrome://extensions
```

### Test Database Schema
Apply SQL migrations in Supabase SQL Editor:
1. Go to https://supabase.com/dashboard/project/glaxxuhfksarxauufyco/sql/new
2. Copy and run `supabase/sql/001_schema.sql`
3. Copy and run `supabase/sql/002_policies.sql`
4. Copy and run `supabase/sql/003_functions.sql`

---

## 🔧 Environment Variables

### Dashboard (Netlify)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Extension (Build-time)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_SUPABASE_FUNCTION_URL`: Edge function URL for event ingestion

---

## 📦 Build Outputs

- **Dashboard**: `dashboard/dist/` - Static files for Netlify
- **Extension**: `extension/dist/` - Chrome extension files
- **Extension Package**: `extension/flowpulse-extension.zip` - Ready for Chrome Web Store

---

## 🔄 Continuous Deployment

Once connected to Netlify via GitHub:
- Every push to `main` branch triggers automatic deployment
- Build logs available in Netlify dashboard
- Preview deployments for pull requests

---

## ⚠️ Important Notes

1. **Database Schema**: Must be applied manually in Supabase before first use
2. **Auth Redirects**: Update after getting production URL from Netlify
3. **Extension Updates**: Rebuild and repackage after any code changes
4. **Edge Function**: Already deployed (`events-ingest` is active)
5. **Daily Summary Function**: Deploy with:
   ```bash
   supabase functions deploy daily-summary --project-ref glaxxuhfksarxauufyco --no-verify-jwt
   ```

---

## 🐛 Troubleshooting

### Dashboard won't build
- Verify all dependencies: `cd dashboard && npm install`
- Check TypeScript: `npm run build`

### Extension won't load
- Ensure icons exist: `ls extension/dist/icons/`
- Regenerate icons: `node extension/generate-icons.cjs`
- Verify manifest: `cat extension/dist/manifest.json`

### Auth not working
- Check Supabase Auth URLs match your deployment URL
- Verify anon key is correct in environment variables
- Check browser console for CORS errors

---

## 📧 Support

For issues, check:
1. Build logs in Netlify dashboard
2. Browser console for frontend errors
3. Supabase logs for backend errors
4. Chrome extension console for background script errors
