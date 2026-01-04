# 🚀 Deployment Guide - Vercel + Railway

Complete step-by-step guide to deploy your Education & Learning Copilot.

---

## 📋 Prerequisites

1. ✅ GitHub account (personal, not office)
2. ✅ Code pushed to GitHub repository
3. ✅ 15 minutes of time

---

## 🎯 Part 1: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Import Your Project
1. In Vercel dashboard, click **"Add New..." → "Project"**
2. Select your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel project settings → Environment Variables, add:
```
VITE_API_URL=https://your-backend-url.railway.app
```
(You'll get the backend URL after deploying to Railway)

### Step 4: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ Your frontend is live!

**Your frontend URL**: `https://your-project.vercel.app`

---

## 🎯 Part 2: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Choose **"Login with GitHub"**
4. Authorize Railway

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository
4. Select **"backend"** folder

### Step 3: Configure Backend
Railway will auto-detect Node.js. Verify:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Add MongoDB (Optional - Railway MongoDB)
1. In Railway project, click **"+ New"**
2. Select **"Database" → "MongoDB"**
3. Railway will create MongoDB instance
4. Copy the connection string

### Step 5: Add Environment Variables
In Railway project → Variables, add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<from Railway MongoDB or your own>
FRONTEND_URL=https://your-frontend.vercel.app
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

### Step 6: Deploy!
1. Railway auto-deploys on git push
2. Or click **"Deploy"** manually
3. Wait 3-5 minutes
4. ✅ Your backend is live!

**Your backend URL**: `https://your-project.railway.app`

---

## 🔄 Part 3: Connect Frontend to Backend

### Update Frontend Environment Variable
1. Go to Vercel dashboard
2. Project → Settings → Environment Variables
3. Update `VITE_API_URL` with your Railway backend URL
4. Redeploy frontend (or it auto-redeploys)

---

## 🔐 Part 4: Set Up CI/CD (GitHub Actions)

### Option A: Automatic (Recommended)
- ✅ Vercel: Auto-deploys on push to `main`
- ✅ Railway: Auto-deploys on push to `main`
- ✅ No setup needed!

### Option B: GitHub Actions (Advanced)
1. Go to GitHub repository → Settings → Secrets
2. Add secrets:
   - `VERCEL_TOKEN` (from Vercel → Settings → Tokens)
   - `VERCEL_ORG_ID` (from Vercel project settings)
   - `VERCEL_PROJECT_ID` (from Vercel project settings)
   - `RAILWAY_TOKEN` (from Railway → Account → Tokens)

3. Push to `main` branch
4. GitHub Actions will deploy automatically

---

## 📝 Part 5: Update Your Code

### Update Frontend API URL
The frontend needs to know the backend URL. Update:

**File**: `frontend/src/services/api/chatbot.api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

This will use:
- Production: `VITE_API_URL` from Vercel env vars
- Local: `http://localhost:5000`

### Update Backend CORS
**File**: `backend/src/server.js`

Make sure CORS allows your Vercel domain:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

## ✅ Part 6: Verify Deployment

### Test Frontend
1. Visit your Vercel URL
2. Open chatbot
3. Send a test message

### Test Backend
```bash
curl https://your-backend.railway.app/health
```

Should return:
```json
{"status":"healthy","timestamp":"..."}
```

---

## 🔄 Part 7: Continuous Deployment

### How It Works
1. **Push code to GitHub** → `git push origin main`
2. **Vercel** automatically detects changes → Deploys frontend
3. **Railway** automatically detects changes → Deploys backend
4. ✅ **Done!** No manual steps needed

### Workflow
```
Code Change → Git Push → GitHub → Auto Deploy
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
              Vercel (Frontend)            Railway (Backend)
                    ↓                               ↓
              ✅ Live in 2 min              ✅ Live in 3 min
```

---

## 🐛 Troubleshooting

### Frontend not connecting to backend?
- ✅ Check `VITE_API_URL` in Vercel env vars
- ✅ Check backend CORS settings
- ✅ Verify backend URL is correct

### Backend not starting?
- ✅ Check Railway logs
- ✅ Verify all environment variables are set
- ✅ Check MongoDB connection string

### Environment variables not working?
- ✅ Rebuild after adding env vars
- ✅ Check variable names (case-sensitive)
- ✅ Restart services

---

## 💰 Cost

### Free Tier Limits
- **Vercel**: 
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for small projects

- **Railway**: 
  - $5 free credit/month
  - Usually enough for small projects
  - Pay-as-you-go after

### Estimated Cost
- **Small project**: $0-5/month
- **Medium project**: $5-20/month

---

## 🎉 Success!

Your app is now:
- ✅ Deployed to production
- ✅ Auto-deploying on git push
- ✅ Using your personal accounts (not office)
- ✅ No Docker account needed
- ✅ Easy to manage

---

## 📚 Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Deploy backend to Railway
3. ✅ Connect them together
4. ✅ Test everything
5. ✅ Share your app! 🚀

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **GitHub Actions**: https://docs.github.com/en/actions

