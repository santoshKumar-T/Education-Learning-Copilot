# 📤 Push Code to GitHub

## Option 1: Using GitHub CLI (Easiest)

```bash
# Install GitHub CLI if not installed
brew install gh

# Login to GitHub
gh auth login

# Push code
git push -u origin main
```

## Option 2: Using Personal Access Token (Recommended)

### Step 1: Create Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token" → "Generate new token (classic)"**
3. Name it: `Education-Learning-Copilot`
4. Select scopes: ✅ **repo** (all)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### Step 2: Push Code
```bash
# Push to GitHub
git push -u origin main

# When prompted:
# Username: santoshKumar-T
# Password: <paste your personal access token>
```

## Option 3: Using SSH (Most Secure)

### Step 1: Generate SSH Key
```bash
ssh-keygen -t ed25519 -C "santoshios921@gmail.com"
# Press Enter to accept default location
# Enter passphrase (optional)
```

### Step 2: Add SSH Key to GitHub
```bash
# Copy public key
cat ~/.ssh/id_ed25519.pub

# Then:
# 1. Go to: https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste the key
# 4. Save
```

### Step 3: Update Remote URL
```bash
git remote set-url origin git@github.com:santoshKumar-T/Education-Learning-Copilot.git
git push -u origin main
```

## ✅ After Pushing

Once code is pushed, you can:
1. Deploy to Vercel (Frontend)
2. Deploy to Railway (Backend)
3. Set up CI/CD

See `QUICK_DEPLOY.md` for next steps!

