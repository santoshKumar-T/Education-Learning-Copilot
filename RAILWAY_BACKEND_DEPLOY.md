# 🚂 Deploy Backend to Railway - Step by Step

## ✅ Frontend is Working!

Great! Your frontend is deployed on Vercel. Now let's deploy the backend to Railway.

---

## 🚀 Quick Deploy (5 minutes)

### Step 1: Go to Railway

1. Open: https://railway.app
2. Click **"Start a New Project"** or **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. You'll see your repositories
4. Find: **`santoshKumar-T/Education-Learning-Copilot`**
5. Click on it

### Step 3: Configure Backend

**⚠️ IMPORTANT Settings:**

1. **Root Directory:**
   - Railway will show the service
   - Click on the service
   - Go to **"Settings"** tab
   - Find **"Root Directory"**
   - Change from: (empty or root)
   - Change to: `backend`
   - Click **"Save"**

2. **Railway will auto-detect:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - These should be correct automatically

### Step 4: Add MongoDB (Recommended)

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "MongoDB"**
3. Railway will create a MongoDB instance
4. Wait for it to provision (1-2 minutes)
5. Click on the MongoDB service
6. Go to **"Variables"** tab
7. Copy the **`MONGO_URL`** or **`MONGODB_URI`** value
   - It will look like: `mongodb://mongo:27017` or similar
   - Save this - you'll need it!

### Step 5: Add Environment Variables

1. Click on your **backend service** (not MongoDB)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these variables one by one:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<paste the MongoDB URI from Step 4>
FRONTEND_URL=<paste your Vercel frontend URL>
JWT_SECRET=<generate a strong random string, min 32 characters>
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

**Important Notes:**
- Replace `<paste the MongoDB URI>` with the actual URI from Railway MongoDB
- Replace `<paste your Vercel frontend URL>` with your Vercel URL (e.g., `https://educationcopoilet.vercel.app`)
- Replace `<generate a strong random string>` with a random secret (you can use: `openssl rand -base64 32` or any random string generator)

### Step 6: Deploy!

1. Railway will **auto-deploy** when you add variables
2. Or click **"Deploy"** manually
3. Wait 3-5 minutes for deployment
4. ✅ **Backend is live!**

### Step 7: Get Backend URL

1. Click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Railway will generate a domain like: `https://your-project.railway.app`
5. **Copy this URL** - you'll need it for the frontend!

---

## 🔗 Step 8: Connect Frontend to Backend

1. **Go to Vercel:**
   - Your Project → Settings → Environment Variables

2. **Update `VITE_API_URL`:**
   - Find `VITE_API_URL`
   - Change value to your Railway backend URL
   - Example: `https://your-project.railway.app`
   - Save

3. **Redeploy Frontend:**
   - Vercel will auto-redeploy
   - Or manually redeploy

---

## ✅ Step 9: Test Your App

1. **Visit your Vercel frontend URL**
2. **Test backend health:**
   - Visit: `https://your-backend.railway.app/health`
   - Should return: `{"status":"healthy",...}`

3. **Test chatbot:**
   - Open chatbot in frontend
   - Send a test message
   - Should get AI response!

---

## 🎉 Success!

Your full-stack app is now:
- ✅ Frontend on Vercel
- ✅ Backend on Railway
- ✅ MongoDB on Railway
- ✅ Connected and working!

---

## 🆘 Troubleshooting

### Backend Not Starting?
- Check Railway logs
- Verify all environment variables are set
- Check MongoDB URI is correct

### Frontend Can't Connect?
- Verify `VITE_API_URL` in Vercel matches Railway URL
- Check backend CORS allows Vercel domain
- Test backend health endpoint directly

### MongoDB Connection Error?
- Verify MongoDB URI from Railway
- Check MongoDB service is running
- Ensure URI includes authentication if needed

---

## 📋 Quick Checklist

- [ ] Railway account created
- [ ] Project created from GitHub
- [ ] Root Directory set to `backend`
- [ ] MongoDB added
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] Backend URL copied
- [ ] Frontend `VITE_API_URL` updated
- [ ] App tested and working

---

**You're almost done! Deploy the backend and connect it to the frontend! 🚀**

