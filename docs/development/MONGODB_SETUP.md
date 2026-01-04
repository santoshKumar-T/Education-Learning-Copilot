# MongoDB Database Setup Guide

## ✅ MongoDB Implementation Complete!

We've successfully migrated from JSON file storage (lowdb) to MongoDB database!

## 🗄️ What Changed

### Before (JSON Storage):
- Data stored in `backend/data/users.json`
- Data stored in `backend/data/conversations.json`
- File-based, not scalable
- No relationships between data

### After (MongoDB):
- Data stored in MongoDB database
- Proper data models with relationships
- Scalable and production-ready
- Better performance and querying

## 📦 Installation

MongoDB dependencies are already installed:
- `mongoose` - MongoDB ODM (Object Document Mapper)

## 🔧 Setup Instructions

### Option 1: Local MongoDB (Recommended for Development)

1. **Install MongoDB locally:**
   ```bash
   # macOS (using Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/education_copilot
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create free account:** https://www.mongodb.com/cloud/atlas

2. **Create a cluster** (free tier available)

3. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education_copilot?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your MongoDB Atlas credentials.

## 🚀 Running the Application

1. **Start MongoDB** (if using local):
   ```bash
   brew services start mongodb-community
   # OR
   docker start mongodb
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check connection:**
   You should see:
   ```
   ✅ MongoDB connected successfully
      Database: education_copilot
      Host: localhost
      Port: 27017
   ```

## 📊 Database Models

### User Model
- `email` - User email (unique, indexed)
- `password` - Hashed password
- `name` - User name
- `role` - User role (user/admin)
- `isActive` - Account status
- `lastLogin` - Last login timestamp
- `sessions` - Array of session IDs (references)
- `createdAt`, `updatedAt` - Timestamps

### Session Model
- `userId` - Reference to User (optional)
- `messages` - Array of messages
- `messageCount` - Total message count
- `lastActivity` - Last activity timestamp
- `createdAt`, `updatedAt` - Timestamps

### Message Schema (embedded in Session)
- `role` - Message role (user/assistant)
- `content` - Message content
- `model` - AI model used
- `prompt_tokens`, `completion_tokens`, `total_tokens` - Token usage
- `createdAt` - Timestamp

## 🔄 Migration from JSON to MongoDB

If you have existing data in JSON files, you can migrate it:

1. **Backup your JSON files:**
   ```bash
   cp backend/data/users.json backend/data/users.json.backup
   cp backend/data/conversations.json backend/data/conversations.json.backup
   ```

2. **Run migration script** (if needed):
   ```bash
   # Migration script can be created to import JSON data
   # For now, users will need to re-register
   ```

## 🧪 Testing

### Test Database Connection:
```bash
# Check if MongoDB is running
mongosh
# Or
mongo
```

### Test Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Check Database:
```bash
# Connect to MongoDB
mongosh education_copilot

# List collections
show collections

# View users
db.users.find().pretty()

# View sessions
db.sessions.find().pretty()
```

## 📝 Environment Variables

Add to your `.env` file:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/education_copilot

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education_copilot
```

## 🔒 Security Notes

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use strong passwords** - Especially for production
3. **Enable authentication** - For production MongoDB instances
4. **Use connection string with credentials** - For MongoDB Atlas

## 🎯 Benefits of MongoDB

✅ **Scalability** - Can handle millions of documents
✅ **Performance** - Fast queries with indexes
✅ **Relationships** - Proper references between collections
✅ **Flexibility** - Schema can evolve over time
✅ **Production-ready** - Used by major companies
✅ **Cloud support** - MongoDB Atlas for easy deployment

## 🐛 Troubleshooting

### Connection Error:
```
❌ MongoDB connection failed
```
**Solution:** 
- Check if MongoDB is running: `brew services list` or `docker ps`
- Verify `MONGODB_URI` in `.env`
- Check MongoDB logs

### Authentication Error:
```
Authentication failed
```
**Solution:**
- Verify username/password in connection string
- Check MongoDB user permissions

### Port Already in Use:
```
Port 27017 already in use
```
**Solution:**
- Stop other MongoDB instances
- Use different port in connection string

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**Database migration complete!** Your application now uses MongoDB instead of JSON files. 🎉


