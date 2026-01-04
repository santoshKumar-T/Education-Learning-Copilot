# MongoDB Quick Setup Guide

## 🚀 Fastest Way: MongoDB Atlas (Cloud - 5 minutes)

### Step 1: Create Free Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. **Free tier (M0) is available** - No credit card required!

### Step 2: Create Cluster
1. After signup, click **"Build a Database"**
2. Choose **"FREE"** tier (M0)
3. Select a cloud provider (AWS recommended)
4. Choose a region close to you
5. Click **"Create"** (takes 1-3 minutes)

### Step 3: Create Database User
1. Click **"Database Access"** in left menu
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username (e.g., `education_copilot_user`)
5. Enter password (save it!)
6. Set privileges: **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Address
1. Click **"Network Access"** in left menu
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your specific IP: `0.0.0.0/0`
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Click **"Database"** in left menu
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`
5. Replace `<password>` with your actual password
6. Add database name at the end: `education_copilot`

**Final connection string:**
```
mongodb+srv://education_copilot_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/education_copilot?retryWrites=true&w=majority
```

### Step 6: Update .env File
1. Open `backend/.env`
2. Add or update:
   ```env
   MONGODB_URI=mongodb+srv://education_copilot_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/education_copilot?retryWrites=true&w=majority
   ```
3. Replace `YOUR_PASSWORD` and `cluster0.xxxxx` with your actual values

### Step 7: Restart Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
   Database: education_copilot
```

---

## 🖥️ Alternative: Local MongoDB

### Install (macOS)
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh --eval "db.version()"
```

### Update .env
```env
MONGODB_URI=mongodb://localhost:27017/education_copilot
```

### Restart Backend
```bash
cd backend
npm run dev
```

---

## ✅ Verify Connection

After setup, you should see in backend console:
```
✅ MongoDB connected successfully
   Database: education_copilot
   Host: cluster0.xxxxx.mongodb.net (or localhost)
```

Then try:
- Register a new user
- Login
- Use chatbot

---

## 🆘 Troubleshooting

### Connection Error
- Check username/password in connection string
- Verify IP is whitelisted in MongoDB Atlas
- Check network connectivity

### Authentication Failed
- Verify database user password is correct
- Check user has proper permissions

### Timeout
- Check internet connection (for Atlas)
- Verify MongoDB service is running (for local)

---

**Need Help?** See `MONGODB_SETUP.md` for detailed instructions.


