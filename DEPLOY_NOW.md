# 🚀 Deploy Now - Quick Steps

## ✅ Step 1: Verify GitHub Push

Your repository should be at:
**https://github.com/santoshKumar-T/Education-Learning-Copilot**

If you can see your code there, you're ready to deploy! ✅

---

## 🌐 Step 2: Deploy Frontend to Vercel (5 minutes)

### Quick Steps:

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login**: Click "Continue with GitHub"
3. **Authorize**: Allow Vercel to access your GitHub
4. **Add Project**: Click "Add New..." → "Project"
5. **Select Repository**: Find `santoshKumar-T/Education-Learning-Copilot`
6. **Click "Import"**

### Configure Project:

**⚠️ IMPORTANT Settings:**

- **Framework Preset**: `Vite` (should auto-detect)
- **Root Directory**: `frontend` ⚠️ **Change this!**
  - Click "Edit" next to Root Directory
  - Type: `frontend`
  - Click "Continue"
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `dist` (auto)
- **Install Command**: `npm install` (auto)

### Environment Variables:

1. Click **"Environment Variables"**
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `http://localhost:5000` (we'll update after Railway)
3. Click **"Add"**

### Deploy:

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. ✅ **Frontend is live!**

**Your Frontend URL**: Copy this URL (you'll need it for Railway)
Example: `https://education-learning-copilot.vercel.app`

---

## 🚂 Step 3: Deploy Backend to Railway (5 minutes)

### Quick Steps:

1. **Go to Railway**: https://railway.app
2. **Sign up/Login**: Click "Login with GitHub"
3. **Authorize**: Allow Railway to access your GitHub
4. **New Project**: Click "New Project"
5. **Deploy from GitHub**: Select "Deploy from GitHub repo"
6. **Select Repository**: Find `santoshKumar-T/Education-Learning-Copilot`
7. **Click on it**

### Configure Backend:

**⚠️ IMPORTANT Settings:**

- **Root Directory**: `backend` ⚠️ **Change this!**
  - Click on the service
  - Go to "Settings"
  - Find "Root Directory"
  - Change to: `backend`
  - Save

Railway will auto-detect:
- Build Command: `npm install`
- Start Command: `npm start`

### Add MongoDB (Recommended):

1. In Railway project, click **"+ New"**
2. Select **"Database" → "MongoDB"**
3. Railway creates MongoDB instance
4. Click on MongoDB service
5. Go to **"Variables"** tab
6. Copy the **`MONGO_URL`** or **`MONGODB_URI`** value

### Add Environment Variables:

1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Add these variables one by one:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<paste from Railway MongoDB>
FRONTEND_URL=<paste your Vercel frontend URL>
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_change_this
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

**Important:**
- Replace `<paste from Railway MongoDB>` with actual MongoDB URI
- Replace `<paste your Vercel frontend URL>` with your Vercel URL
- Replace `JWT_SECRET` with a strong random string (min 32 chars)

### Deploy:

1. Railway auto-deploys when you add variables
2. Or click **"Deploy"** manually
3. Wait 3-5 minutes
4. ✅ **Backend is live!**

**Your Backend URL**: 
- Click on backend service
- Go to "Settings" → "Domains"
- Copy the generated domain
- Example: `https://your-project.railway.app`

---

## 🔗 Step 4: Connect Frontend to Backend

1. **Go to Vercel**: Your project → Settings → Environment Variables
2. **Update**: `VITE_API_URL`
   - Change value to your Railway backend URL
   - Example: `https://your-project.railway.app`
3. **Save**
4. **Redeploy**: Vercel will auto-redeploy, or click "Redeploy"

---

## ✅ Step 5: Test Your App

1. **Visit**: Your Vercel frontend URL
2. **Open**: Chatbot
3. **Send**: Test message like "Hello"
4. **Check**: Should get AI response
5. ✅ **Everything working!**

---

## 🎉 Success!

Your app is now:
- ✅ Live on the internet
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ Auto-deploying on every git push

---

## 🆘 Troubleshooting

### Vercel Build Fails?
- Check Root Directory is `frontend`
- Check Build Command is `npm run build`
- Check Output Directory is `dist`

### Railway Deploy Fails?
- Check Root Directory is `backend`
- Check all environment variables are set
- Check MongoDB URI is correct
- View logs in Railway dashboard

### Frontend Can't Connect to Backend?
- Check `VITE_API_URL` in Vercel matches Railway URL
- Check Railway CORS allows Vercel domain
- Check backend is running (test `/health` endpoint)

### Chatbot Not Working?
- Check OpenAI API key is correct in Railway
- Check backend logs for errors
- Test backend directly: `curl https://your-backend.railway.app/health`

---

## 📚 Need More Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Detailed Guides**: See other `.md` files in this repo

---

**You're all set! Happy deploying! 🚀**

