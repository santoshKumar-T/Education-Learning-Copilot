# 🔧 Fix Railway Build Error: Root Directory

## ❌ Error
```
Nixpacks was unable to generate a build plan for this app.
```

## 🔍 Problem

Railway is trying to build from the **root directory** instead of the `backend` folder. It can't find `package.json` at the root level.

---

## ✅ Solution: Set Root Directory in Railway

### Step 1: Go to Railway Service Settings

1. Go to your Railway project
2. Click on your **backend service** (the one that's failing)
3. Go to **"Settings"** tab
4. Scroll down to **"Root Directory"** section

### Step 2: Set Root Directory

1. Find **"Root Directory"** field
2. Click **"Edit"** or the field itself
3. Type: `backend`
4. Click **"Save"**

### Step 3: Redeploy

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for build

---

## 🔍 Verify Root Directory is Set

After setting Root Directory to `backend`, Railway should:
- ✅ Find `backend/package.json`
- ✅ Detect Node.js automatically
- ✅ Run `npm install` in `backend/` folder
- ✅ Run `npm start` to start the server

---

## 📋 What Railway Should See

When Root Directory is set to `backend`, Railway will see:
```
backend/
  ├── package.json ✅
  ├── package-lock.json
  ├── src/
  │   └── server.js
  └── ...
```

Instead of looking at root:
```
/
  ├── backend/
  ├── frontend/
  ├── README.md
  └── ... (no package.json here)
```

---

## ✅ After Fix

Once Root Directory is set to `backend`:
1. Railway will detect Node.js
2. Build will succeed
3. Backend will deploy

---

## 🆘 Still Not Working?

### Check Railway Logs

1. Go to Railway → Your Service → **"Deployments"**
2. Click on the failed deployment
3. Check **"Build Logs"**
4. Look for errors

### Verify Settings

- [ ] Root Directory = `backend`
- [ ] Build Command = `npm install` (auto-detected)
- [ ] Start Command = `npm start` (auto-detected)

### Alternative: Use railway.toml

I've updated `railway.toml` with explicit paths. Push it:

```bash
git add railway.toml
git commit -m "Fix Railway build - set backend directory"
git push
```

---

**The fix: Set Root Directory to `backend` in Railway Settings!**

