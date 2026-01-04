# Password Storage Fix

## 🔧 Issue Fixed

**Problem:** Users registered successfully, but after clearing cookies and trying to login again, they got "Invalid email or password" error.

**Root Cause:** The password field was not being saved to the database. The `User` class's `toJSON()` method was excluding the password field for security reasons, but this meant passwords weren't persisted.

## ✅ Solution Applied

1. **Updated User Model**: Modified `toJSON()` to include password for database storage
2. **Fixed Save Operations**: Changed all user save operations to explicitly save password as plain object
3. **Migration Script**: Created script to identify users without passwords

## 🚨 Important: Existing Users Need to Re-register

If you registered before this fix, your password was not saved. You need to:

### Option 1: Re-register (Recommended)
1. Delete the existing user from `backend/data/users.json` (or just register with a different email)
2. Register again with the same email
3. Your password will now be saved correctly

### Option 2: Run Migration Script
```bash
cd backend
node src/scripts/migrate-users.js
```

This will identify users without passwords, but they still need to re-register.

## 🧪 Test the Fix

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }'
   ```

2. **Verify password is saved:**
   ```bash
   cat backend/data/users.json | grep -A 2 password
   ```
   You should see the password hash.

3. **Test login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

4. **Clear cookies and login again:**
   - Clear browser cookies/localStorage
   - Login with same credentials
   - ✅ Should work now!

## 📝 What Changed

### User Model (`backend/src/models/user.model.js`)
- `toJSON()` now includes `password` field for database storage
- `toPublicJSON()` still excludes password for API responses

### Auth Service (`backend/src/services/auth/auth.service.js`)
- All user save operations now explicitly save password as plain object
- Ensures password is always persisted to database

## 🔒 Security Note

- Passwords are still hashed with bcrypt before saving
- Passwords are never returned in API responses
- Only the hash is stored in the database

## ✅ Verification

After the fix, check `backend/data/users.json`:
```json
{
  "users": {
    "user-id": {
      "id": "user-id",
      "email": "user@example.com",
      "password": "$2a$10$hashed...",  // ✅ Password hash should be here
      "name": "User Name",
      ...
    }
  }
}
```

If `password` field is missing, the user needs to re-register.


