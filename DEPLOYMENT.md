# PHUNTROO - GitHub Pages Deployment Guide

## 🚀 Quick Deploy (10 Minutes)

Your PHUNTROO AI Assistant is ready to deploy to GitHub Pages for FREE!

---

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub (if not already there)

```bash
cd d:\Jarvis-main
git init
git add .
git commit -m "Initial PHUNTROO commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/phuntroo.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Done! The workflow will trigger automatically

---

## Step 3: Wait for Deployment

1. Go to **Actions** tab in your repo
2. Watch the "Deploy PHUNTROO to GitHub Pages" workflow
3. Once complete (✅ green checkmark), your site is live!

---

## 🌐 Your Live URL

```
https://YOUR_USERNAME.github.io/phuntroo/
```

(Replace `YOUR_USERNAME` with your GitHub username)

---

## 🔧 Local Production Build (Test Before Deploy)

```bash
cd d:\Jarvis-main\web
npm install
npm run build
npm run preview
```

Open `http://localhost:4173` to see the production build locally.

---

## 📦 What Gets Deployed

- ✅ Optimized React bundle (minified, tree-shaken)
- ✅ Brotli & Gzip compressed assets
- ✅ Code-split chunks for faster loading
- ✅ VRM avatar (loads from external CDN)
- ✅ All CSS and static assets

**Size**: ~2-5 MB total (perfect for GitHub Pages!)

---

## 🎨 Custom Domain (Optional)

To use your own domain (e.g., `phuntroo.ai`):

1. Settings → Pages → Custom domain
2. Enter your domain
3. Add DNS records from your domain provider:
   - `A` record: `185.199.108.153`
   - `A` record: `185.199.109.153`
   - `A` record: `185.199.110.153`
   - `A` record: `185.199.111.153`
4. Wait for DNS propagation (~24 hours)

---

## 🔄 Auto-Deploy Workflow

Every time you push to `main`:
1. GitHub Actions builds your app
2. Optimizes all assets
3. Deploys to Pages automatically
4. Live in ~2-3 minutes!

---

## 🐛 Troubleshooting

### Build Fails in GitHub Actions

Check the Actions tab for errors. Common fixes:

```bash
# Locally test the build
cd web
npm run build

# If it fails, fix errors and commit
git add .
git commit -m "Fix build errors"
git push
```

### 404 on Deployed Site

Your app uses client-side routing. Create `web/public/404.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0;url=/phuntroo/">
  </head>
  <body></body>
</html>
```

### Large Model Files

If you want to host custom VRM models:
1. Use Cloudflare R2 (10GB free)
2. Upload your `.vrm` files
3. Update `VRMAvatar.jsx` with R2 URLs

---

## 📊 Performance

Expected Lighthouse scores:
- **Performance**: 85-95
- **Accessibility**: 90+
- **Best Practices**: 95+
- **SEO**: 90+

---

## 🎉 You're Done!

Your PHUNTROO AI Assistant is now live and accessible worldwide. Share the link with anyone!

**Next Steps:**
- Add more features to `App.jsx`
- Customize the VRM avatar
- Connect to a backend API (use Vercel/Railway for free API hosting)

---

## 📝 Notes

- **Free hosting**: No credit card required
- **SSL/HTTPS**: Automatically enabled
- **CDN**: Global edge network
- **Uptime**: 99.9%+
- **Storage**: 1GB soft limit (plenty for frontend apps)

**Need help?** Open an issue in your repo!
