# Memory & Storage System Explained

## 📦 What Storage System We're Using

### Current Implementation: **JSON File Storage (lowdb)**

We're using **lowdb** - a simple JSON file-based database. It's perfect for:
- ✅ Development and testing
- ✅ Small to medium applications
- ✅ Easy to understand and debug
- ✅ No database server needed

### Storage Location

**File:** `backend/data/conversations.json`

**Structure:**
```json
{
  "sessions": {
    "session-id-1": {
      "id": "session-id-1",
      "userId": null,
      "createdAt": "2024-12-21T...",
      "lastActivity": "2024-12-21T...",
      "messageCount": 5
    }
  },
  "conversations": {
    "session-id-1": [
      {
        "id": "msg-1",
        "role": "user",
        "content": "Hello!",
        "timestamp": "2024-12-21T...",
        "model": "gpt-3.5-turbo-0125",
        "total_tokens": 50
      },
      {
        "id": "msg-2",
        "role": "assistant",
        "content": "Hi! How can I help?",
        "timestamp": "2024-12-21T...",
        "model": "gpt-3.5-turbo-0125",
        "total_tokens": 75
      }
    ]
  }
}
```

## 🧠 How Memory Works

### 1. **Session Storage (lowdb/JSON)**
- **What**: Stores all conversations in a JSON file
- **Where**: `backend/data/conversations.json`
- **Purpose**: Persistent storage across server restarts
- **Technology**: lowdb library

### 2. **LangChain Memory**
- **What**: LangChain's internal conversation memory
- **Where**: In-memory (during conversation)
- **Purpose**: Better context understanding
- **Technology**: LangChain's BufferMemory (when fully implemented)

### 3. **Browser localStorage**
- **What**: Stores session ID in your browser
- **Where**: Browser's localStorage
- **Purpose**: Remember which session to use when you return
- **Technology**: Browser localStorage API

## 🔄 How It All Works Together

```
1. User opens chatbot
   ↓
2. Frontend checks localStorage for sessionId
   ↓
3. If found → Load conversation from backend/data/conversations.json
   ↓
4. If not found → Create new session, save ID to localStorage
   ↓
5. User sends message
   ↓
6. Backend loads conversation history from JSON file
   ↓
7. LangChain uses history for context
   ↓
8. Response generated
   ↓
9. Both user and bot messages saved to JSON file
   ↓
10. Next time: History is loaded automatically
```

## 📊 Storage Technologies Used

### ✅ Currently Implemented:

1. **lowdb (JSON File Database)**
   - **Purpose**: Persistent conversation storage
   - **Location**: `backend/data/conversations.json`
   - **Pros**: Simple, no setup needed, easy to debug
   - **Cons**: Not ideal for production with many users

2. **Browser localStorage**
   - **Purpose**: Remember session ID
   - **Location**: Browser storage
   - **Pros**: Automatic, no server needed
   - **Cons**: Only works on same browser

3. **Session Service**
   - **Purpose**: Manage sessions and conversations
   - **Location**: `backend/src/services/session/session.service.js`
   - **Features**: Create, read, update, delete sessions

### ❌ NOT Implemented (Yet):

1. **MongoDB** - NoSQL database (can be added)
2. **PostgreSQL** - SQL database (can be added)
3. **Redis** - Fast in-memory storage (can be added)
4. **Authentication** - User login system (not implemented)

## 🔐 Authentication Status

### Current Status: ❌ **NOT Implemented**

**What we have:**
- ✅ Session management (anonymous sessions)
- ✅ Session IDs for tracking
- ✅ Storage structure ready for user IDs
- ❌ No login/signup system
- ❌ No user authentication
- ❌ No password management
- ❌ No JWT tokens for auth (configured but not used)

### What's Prepared (But Not Active):

In the code, you'll see:
- `userId` field in sessions (currently `null`)
- JWT configuration in `.env`
- Auth middleware folders created
- But no actual authentication endpoints

### To Add Authentication (Future):

1. **User Registration/Login**
   - Create user accounts
   - Password hashing
   - JWT token generation

2. **Session Linking**
   - Link sessions to user accounts
   - Multiple sessions per user
   - Session history per user

3. **Access Control**
   - Protect API endpoints
   - User-specific data access
   - Role-based permissions

## 💾 Database Options (For Future)

### Option 1: MongoDB (Recommended for Production)
```javascript
// Easy to add later
import { MongoClient } from 'mongodb';
// Store sessions and conversations in MongoDB
```

### Option 2: PostgreSQL
```javascript
// SQL database
// Better for structured data
// More complex queries
```

### Option 3: Keep JSON (Current)
```javascript
// Good for development
// Simple and works
// Not scalable for many users
```

## 🧪 How to See Your Stored Data

### View Conversation Storage:

```bash
# View the JSON file
cat backend/data/conversations.json | python3 -m json.tool

# Or open in editor
code backend/data/conversations.json
```

### Check Browser Storage:

1. Open browser console (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Click "Local Storage"
4. Look for `chatbot_session_id`

## 📈 Current Storage Capacity

- **Sessions**: Unlimited (stored in JSON)
- **Messages per session**: Unlimited
- **File size**: Grows with conversations
- **Performance**: Good for < 1000 sessions

## 🔄 Migration Path (If Needed)

If you need to move to a real database later:

1. **Keep current structure** - JSON format is simple
2. **Add database service** - MongoDB/PostgreSQL
3. **Update session.service.js** - Change storage backend
4. **Migrate data** - Move JSON to database
5. **No frontend changes needed** - API stays the same

## 🎯 Summary

### What We're Using:
- ✅ **lowdb** - JSON file database
- ✅ **localStorage** - Browser session ID storage
- ✅ **Session Service** - Manages conversations
- ✅ **LangChain** - Uses stored history for context

### What We're NOT Using:
- ❌ MongoDB/PostgreSQL (can add later)
- ❌ Authentication system (not implemented)
- ❌ User accounts (sessions are anonymous)

### Current Flow:
1. Conversations saved to `backend/data/conversations.json`
2. Session ID saved in browser localStorage
3. LangChain loads history from JSON file
4. New messages appended to JSON file
5. Everything persists across browser/server restarts

---

**Your data is being stored!** Check `backend/data/conversations.json` to see all your conversations! 📁


