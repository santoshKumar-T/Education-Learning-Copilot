# 🔧 Fix Registration on Local

## ✅ Test User Created!

A test user has been created for you to test the flow:

**Login Credentials:**
- **Email**: `test@example.com`
- **Password**: `Test123!`

You can use these credentials to login and test the Dashboard and Settings pages!

---

## 🐛 Registration Issue

If registration isn't working, here are common causes and fixes:

### Issue 1: MongoDB Not Running

**Check:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
```

**Fix:**
```bash
# Start MongoDB
brew services start mongodb-community
```

### Issue 2: CORS Issue

**Check:**
- Backend `.env` has `FRONTEND_URL=http://localhost:3000` (no trailing slash)
- Backend is running on port 5000
- Frontend is running on port 3000

**Fix:**
1. Check `backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```
2. Restart backend after changing `.env`

### Issue 3: Database Connection Error

**Check backend logs for:**
```
⚠️  MongoDB connection failed
```

**Fix:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env` is correct
- For local: `MONGODB_URI=mongodb://localhost:27017/education_copilot`

---

## 🧪 Test Registration

### Option 1: Use Test User (Easiest)

**Login with:**
- Email: `test@example.com`
- Password: `Test123!`

### Option 2: Test Registration API Directly

Run in browser console on `http://localhost:3000`:

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'Password123!',
    name: 'New User'
  })
})
  .then(res => res.json())
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Error:', err));
```

---

## 🔍 Debug Steps

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check MongoDB is Running:**
   ```bash
   brew services list | grep mongodb
   ```

3. **Check Backend Logs:**
   - Look for registration requests
   - Check for errors

4. **Check Browser Console:**
   - Look for CORS errors
   - Check network tab for failed requests

---

## 📋 Quick Checklist

- [ ] MongoDB is running (`brew services start mongodb-community`)
- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] `FRONTEND_URL=http://localhost:3000` in backend `.env`
- [ ] `MONGODB_URI=mongodb://localhost:27017/education_copilot` in backend `.env`
- [ ] Test user created (use credentials above)

---

## 🎯 Use Test User

**For now, use the test user to test the flow:**
- Email: `test@example.com`
- Password: `Test123!`

This will let you test Dashboard and Settings without fixing registration first!

---

**Test user is ready - use it to login and test!** 🚀

