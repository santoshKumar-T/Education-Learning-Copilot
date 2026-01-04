# 🚀 Vercel Deployment - Step by Step

## Quick Deploy (5 minutes)

### Step 1: Go to Vercel
1. Open: https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Import Project
1. In Vercel dashboard, click **"Add New..." → "Project"**
2. You'll see your repositories
3. Find: **`santoshKumar-T/Education-Learning-Copilot`**
4. Click **"Import"**

### Step 3: Configure Project
Vercel will auto-detect Vite, but verify these settings:

**Project Settings:**
- **Framework Preset**: `Vite` (auto-detected)
- **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `dist` (auto)
- **Install Command**: `npm install` (auto)

**Environment Variables:**
- Click **"Environment Variables"**
- Add:
  - **Key**: `VITE_API_URL`
  - **Value**: `https://your-backend.railway.app` (we'll update this after Railway deploy)
  - For now, use: `http://localhost:5000` (we'll change it later)

### Step 4: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ Your frontend is live!

**Your Frontend URL**: `https://education-learning-copilot.vercel.app` (or similar)

---

## ✅ After Deployment

1. **Copy your Vercel URL** (you'll need it for Railway)
2. **Note**: We'll update `VITE_API_URL` after backend is deployed

---

## 🔄 Update Environment Variable Later

After Railway backend is deployed:
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` with your Railway backend URL
3. Redeploy (or it auto-redeploys)

---

## 🎉 Done!

Your frontend is now live on Vercel! 🚀

