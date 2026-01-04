# 🚀 Complete Deployment Guide

## Step 1: Push to GitHub

### Option A: Use the Script (Easiest)
```bash
./PUSH_WITH_TOKEN.sh
```

### Option B: Manual Push
```bash
# First, make sure repository exists on GitHub
# Go to: https://github.com/new
# Create repository: Education-Learning-Copilot
# Don't initialize with README

# Then push:
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/santoshKumar-T/Education-Learning-Copilot.git
git push -u origin main
```

**⚠️ Important:** If you get a 403 error, the repository might not exist. Create it first on GitHub.

---

## Step 2: Deploy Frontend to Vercel

### Quick Steps:
1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click**: "Add New Project"
4. **Select**: `santoshKumar-T/Education-Learning-Copilot`
5. **Configure**:
   - Framework: Vite
   - Root Directory: `frontend` ⚠️
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Environment Variables**:
   - Add: `VITE_API_URL` = `http://localhost:5000` (we'll update after Railway)
7. **Click**: "Deploy"
8. **Wait**: 2-3 minutes
9. ✅ **Frontend is live!**

**Your Frontend URL**: Copy this URL (you'll need it for Railway)

---

## Step 3: Deploy Backend to Railway

### Quick Steps:
1. **Go to**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: `santoshKumar-T/Education-Learning-Copilot`
6. **Configure**:
   - Root Directory: `backend` ⚠️
   - Railway auto-detects Node.js
7. **Add MongoDB** (Optional):
   - Click "+ New" → "Database" → "MongoDB"
   - Copy the connection string
8. **Environment Variables**:
   Add these in Railway → Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://... (from Railway MongoDB)
   FRONTEND_URL=https://your-frontend.vercel.app (from Vercel)
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
   OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_TEMPERATURE=0.7
   OPENAI_MAX_TOKENS=1000
   ```
9. **Click**: "Deploy"
10. **Wait**: 3-5 minutes
11. ✅ **Backend is live!**

**Your Backend URL**: Copy this URL (you'll need it for Vercel)

---

## Step 4: Connect Frontend to Backend

1. **Go to**: Vercel → Your Project → Settings → Environment Variables
2. **Update**: `VITE_API_URL` with your Railway backend URL
3. **Redeploy**: Frontend will auto-redeploy

---

## Step 5: Test Your App

1. **Visit**: Your Vercel frontend URL
2. **Open**: Chatbot
3. **Send**: Test message
4. ✅ **Everything should work!**

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Environment variables configured
- [ ] Frontend connected to backend
- [ ] App tested and working

---

## 🎉 You're Done!

Your app is now:
- ✅ Live on the internet
- ✅ Auto-deploying on every git push
- ✅ Using Vercel + Railway
- ✅ No Docker needed!

---

## 📚 Detailed Guides

- **Vercel**: See `VERCEL_DEPLOYMENT.md`
- **Railway**: See `RAILWAY_DEPLOYMENT.md`
- **Quick Start**: See `QUICK_DEPLOY.md`

---

## 🆘 Troubleshooting

### GitHub Push Issues
- **403 Error**: Repository doesn't exist → Create it on GitHub first
- **Token Error**: Check token has 'repo' scope

### Vercel Issues
- **Build Fails**: Check Root Directory is `frontend`
- **404 Error**: Check Output Directory is `dist`

### Railway Issues
- **Deploy Fails**: Check Root Directory is `backend`
- **Connection Error**: Check environment variables
- **MongoDB Error**: Check MONGODB_URI is correct

---

**Happy Deploying! 🚀**

