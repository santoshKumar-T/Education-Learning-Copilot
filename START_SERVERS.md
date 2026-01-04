# Starting Backend and Frontend Servers

## Quick Start Guide

### Prerequisites

1. **MongoDB Setup** (Choose one):
   - **Local MongoDB**: Install and start MongoDB
   - **Docker**: Run MongoDB in Docker container
   - **MongoDB Atlas**: Use cloud MongoDB (free tier available)

2. **Environment Variables**:
   - Backend `.env` file must have `MONGODB_URI`

## Step-by-Step Setup

### 1. Setup MongoDB

#### Option A: MongoDB Atlas (Cloud - Easiest)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Add to `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education_copilot
   ```

#### Option B: Local MongoDB (macOS)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Add to backend/.env
echo "MONGODB_URI=mongodb://localhost:27017/education_copilot" >> backend/.env
```

#### Option C: Docker

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb-education-copilot mongo:latest

# Add to backend/.env
echo "MONGODB_URI=mongodb://localhost:27017/education_copilot" >> backend/.env
```

### 2. Configure Backend

```bash
cd backend

# Run setup script
chmod +x setup-mongodb.sh
./setup-mongodb.sh

# Or manually add to .env
echo "MONGODB_URI=mongodb://localhost:27017/education_copilot" >> .env
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully
   Database: education_copilot
   Host: localhost
   Port: 27017

🚀 Education & Learning Copilot - Backend Server
📍 Server running on http://localhost:5000
```

### 4. Start Frontend Server

**In a new terminal:**

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Testing

### Test Backend

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

### Test Frontend

Open browser: http://localhost:3000

### Test MongoDB Connection

```bash
# If MongoDB is running locally
mongosh education_copilot

# Or check from Node.js
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/education_copilot').then(() => console.log('Connected!')).catch(e => console.error(e))"
```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoDB connection failed`

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Local
   brew services list | grep mongodb
   
   # Docker
   docker ps | grep mongo
   ```

2. Verify `MONGODB_URI` in `.env`:
   ```bash
   cat backend/.env | grep MONGODB_URI
   ```

3. Test connection:
   ```bash
   mongosh "mongodb://localhost:27017/education_copilot"
   ```

### Backend Won't Start

1. Check if port 5000 is in use:
   ```bash
   lsof -i :5000
   ```

2. Check backend logs for errors

3. Verify all dependencies installed:
   ```bash
   cd backend
   npm install
   ```

### Frontend Won't Start

1. Check if port 3000 is in use:
   ```bash
   lsof -i :3000
   ```

2. Verify all dependencies installed:
   ```bash
   cd frontend
   npm install
   ```

## Running Both Servers

### Option 1: Two Terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option 2: Background Processes

```bash
# Backend
cd backend && npm run dev > backend.log 2>&1 &

# Frontend
cd frontend && npm run dev > frontend.log 2>&1 &

# Check logs
tail -f backend.log
tail -f frontend.log
```

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/

## Next Steps

1. ✅ MongoDB running
2. ✅ Backend running on port 5000
3. ✅ Frontend running on port 3000
4. 🧪 Test registration/login
5. 🧪 Test chatbot

---

**Need Help?** Check the logs or see `MONGODB_SETUP.md` for detailed MongoDB setup.


