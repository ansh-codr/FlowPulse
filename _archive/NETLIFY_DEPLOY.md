# 🚀 Deploy FlowPulse to Netlify

Your code is now on GitHub! Follow these steps to deploy to Netlify.

---

## 📝 Step-by-Step Deployment

### 1. Go to Netlify
Visit: **https://app.netlify.com**

### 2. Import Project
1. Click **"Add new site"** button
2. Select **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account (if not already done)

### 3. Select Repository
1. Find and click: **ansh-codr/FlowPulse**
2. Click **"Configure"** or **"Select"**

### 4. Configure Build Settings
Netlify will auto-detect these from `netlify.toml`, but verify:

- **Base directory**: (leave empty)
- **Build command**: `cd dashboard && npm install && npm run build`
- **Publish directory**: `dashboard/dist`

### 5. Add Environment Variables
Click **"Add environment variables"** and add these:

| Variable Name | Value |
|--------------|-------|
| `VITE_SUPABASE_URL` | `https://glaxxuhfksarxauufyco.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYXh4dWhma3NhcnhhdXVmeWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTkyODIsImV4cCI6MjA3OTczNTI4Mn0.0q6hFNgm2oBIORj07v9XcySa5IBRcHS8X5DVFhFvsOw` |

### 6. Deploy!
Click **"Deploy site"**

Netlify will:
- ✅ Clone your repo
- ✅ Install dependencies
- ✅ Build the dashboard
- ✅ Deploy to CDN

⏱️ First deploy takes ~2-3 minutes

---

## 🔗 After Deployment

### 1. Get Your Site URL
Once deployed, Netlify gives you a URL like:
```
https://flowpulse-abc123.netlify.app
```

### 2. Update Supabase Auth URLs

**IMPORTANT:** Update these in Supabase dashboard:

1. Go to: https://supabase.com/dashboard/project/glaxxuhfksarxauufyco/auth/url-configuration

2. Update:
   - **Site URL**: `https://your-site.netlify.app`
   - **Redirect URLs**: Add `https://your-site.netlify.app/**`

3. Click **Save**

### 3. Test Your Deployment

1. Visit your Netlify URL
2. Click "Sign in"
3. Enter your email
4. Check inbox for magic link
5. Click link → should redirect to dashboard

---

## 🎨 Custom Domain (Optional)

### Add Your Own Domain
1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to update DNS records
4. Once verified, update Supabase Auth URLs to use your domain

---

## 🔄 Continuous Deployment

Now that your repo is connected:
- ✅ Every `git push` to `main` triggers automatic deployment
- ✅ Preview deployments for pull requests
- ✅ Rollback to previous deployments anytime

---

## 🛠️ Build Logs

If deployment fails:
1. Click on the failed deploy in Netlify dashboard
2. Check **Deploy log** for errors
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Build command issues

---

## 📱 Deploy Extension

Extension is already packaged at:
```
extension/flowpulse-extension.zip
```

Upload to Chrome Web Store:
1. Go to: https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload the ZIP file
4. Fill in metadata
5. Submit for review

---

## ✅ Checklist

- [ ] Code pushed to GitHub ✅ (Done!)
- [ ] Netlify site created
- [ ] Environment variables added
- [ ] Dashboard deployed
- [ ] Supabase Auth URLs updated
- [ ] Database schema applied (see DEPLOYMENT.md)
- [ ] Extension uploaded to Chrome Web Store

---

## 🆘 Need Help?

Check these resources:
- **Full guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Netlify docs**: https://docs.netlify.com
- **Supabase docs**: https://supabase.com/docs

---

**Your FlowPulse is ready to go live! 🌊⚡**
