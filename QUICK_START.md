# Quick Start Guide

## 🚀 Start Everything in 3 Steps

### Step 1: Setup MongoDB (Choose One)

#### Option A: MongoDB Atlas (Cloud - Easiest) ⭐ Recommended

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education_copilot
   ```

#### Option B: Local MongoDB

```bash
# Install (macOS)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Verify it's running
mongosh --eval "db.version()"
```

#### Option C: Docker

```bash
docker run -d -p 27017:27017 --name mongodb-education-copilot mongo:latest
```

### Step 2: Start Backend

**Option 1: Using Script**
```bash
./start-backend.sh
```

**Option 2: Manual**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully
🚀 Education & Learning Copilot - Backend Server
📍 Server running on http://localhost:5000
```

### Step 3: Start Frontend (New Terminal)

**Option 1: Using Script**
```bash
./start-frontend.sh
```

**Option 2: Manual**
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3000/
```

## ✅ Verify Everything is Running

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Frontend:**
   Open browser: http://localhost:3000

3. **MongoDB Connection:**
   Check backend console for: `✅ MongoDB connected successfully`

## 🧪 Test the Application

1. **Register a User:**
   - Open http://localhost:3000
   - Click "Login / Sign Up"
   - Click "Register"
   - Create an account

2. **Use Chatbot:**
   - Click chatbot icon
   - Send a message
   - Should get AI response

3. **Test Session Recovery:**
   - Send: "My name is John"
   - Clear cookies
   - Login again
   - Ask: "What is my name?"
   - Should remember!

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoDB connection failed`

**Fix:**
1. Check MongoDB is running:
   ```bash
   # Local
   brew services list | grep mongodb
   
   # Docker
   docker ps | grep mongo
   ```

2. Verify `.env` has correct `MONGODB_URI`

3. Test connection:
   ```bash
   mongosh "mongodb://localhost:27017/education_copilot"
   ```

### Backend Won't Start

1. Check port 5000:
   ```bash
   lsof -i :5000
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

### Frontend Won't Start

1. Check port 3000:
   ```bash
   lsof -i :3000
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

## 📊 Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Root**: http://localhost:5000/

## 📝 Environment Variables

Make sure `backend/.env` has:
```env
MONGODB_URI=mongodb://localhost:27017/education_copilot
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-secret-key
```

---

**Ready to go!** 🎉

For detailed setup, see `START_SERVERS.md` or `MONGODB_SETUP.md`


