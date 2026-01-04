# ⚡ Quick Deploy Guide (15 Minutes)

## 🎯 Step-by-Step

### 1️⃣ Frontend → Vercel (5 min)

```bash
# 1. Go to vercel.com
# 2. Sign up with GitHub
# 3. Click "Add New Project"
# 4. Select your repo
# 5. Configure:
#    - Root Directory: frontend
#    - Framework: Vite
#    - Build Command: npm run build
#    - Output Directory: dist
# 6. Click Deploy
```

**Done!** Frontend URL: `https://your-project.vercel.app`

---

### 2️⃣ Backend → Railway (5 min)

```bash
# 1. Go to railway.app
# 2. Sign up with GitHub
# 3. Click "New Project"
# 4. Select "Deploy from GitHub repo"
# 5. Choose your repo
# 6. Set Root Directory: backend
# 7. Add environment variables (see below)
# 8. Deploy!
```

**Done!** Backend URL: `https://your-project.railway.app`

---

### 3️⃣ Connect Them (3 min)

```bash
# 1. Copy Railway backend URL
# 2. Go to Vercel → Project Settings → Environment Variables
# 3. Add: VITE_API_URL = https://your-backend.railway.app
# 4. Redeploy frontend
```

**Done!** Everything connected! 🎉

---

### 4️⃣ Environment Variables

**Railway (Backend):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://... (or use Railway MongoDB)
FRONTEND_URL=https://your-frontend.vercel.app
JWT_SECRET=your_secret_here
OPENAI_API_KEY=sk-proj-your-key
OPENAI_MODEL=gpt-3.5-turbo
```

**Vercel (Frontend):**
```env
VITE_API_URL=https://your-backend.railway.app
```

---

## ✅ That's It!

Your app is now live and auto-deploying on every git push! 🚀

