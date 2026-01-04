# Session Management & Memory Storage Guide

## Overview

Your chatbot now has **session management** and **conversation memory**! This means:

✅ **Conversations are saved** - All messages are stored  
✅ **Persistent across sessions** - Close browser, come back later, history is there  
✅ **Session tracking** - Each conversation has a unique session ID  
✅ **Retrievable history** - Load previous conversations anytime  

## How It Works

### 1. **Session Creation**
- When you first open the chatbot, a new session is created
- Session ID is stored in browser's `localStorage`
- Session persists even after closing browser

### 2. **Message Storage**
- Every message (user + bot) is saved to disk
- Stored in: `backend/data/conversations.json`
- Includes metadata: timestamps, tokens, model used

### 3. **History Retrieval**
- When you reopen chatbot, it loads your previous conversation
- Messages are restored in chronological order
- You can continue where you left off

## API Endpoints

### Create Session
```bash
POST /api/session/create
```
Creates a new chat session.

**Response:**
```json
{
  "success": true,
  "sessionId": "abc-123-def-456",
  "session": {
    "id": "abc-123-def-456",
    "createdAt": "2024-12-21T...",
    "lastActivity": "2024-12-21T...",
    "messageCount": 0
  }
}
```

### Get Conversation History
```bash
GET /api/session/:sessionId/history
```
Retrieves all messages for a session.

**Response:**
```json
{
  "success": true,
  "sessionId": "abc-123-def-456",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hello",
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
  ],
  "count": 2
}
```

### Get Session Stats
```bash
GET /api/session/:sessionId/stats
```
Get statistics about a session.

**Response:**
```json
{
  "success": true,
  "stats": {
    "sessionId": "abc-123-def-456",
    "createdAt": "2024-12-21T...",
    "lastActivity": "2024-12-21T...",
    "messageCount": 10,
    "userMessages": 5,
    "assistantMessages": 5,
    "totalTokens": 1500,
    "estimatedCost": 0.003
  }
}
```

## Frontend Integration

The frontend automatically:
1. **Creates session** when chatbot opens (if none exists)
2. **Saves session ID** in localStorage
3. **Loads history** when chatbot reopens
4. **Sends session ID** with each message
5. **Restores messages** from previous session

## Storage Location

Conversations are stored in:
```
backend/data/conversations.json
```

**Structure:**
```json
{
  "sessions": {
    "session-id-1": {
      "id": "session-id-1",
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
        "content": "Hello",
        "timestamp": "2024-12-21T...",
        "model": "gpt-3.5-turbo-0125",
        "total_tokens": 50
      }
    ]
  }
}
```

## Testing Session Management

### Test 1: Create Session
```bash
curl -X POST http://localhost:5000/api/session/create \
  -H "Content-Type: application/json"
```

### Test 2: Send Message with Session
```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "conversationHistory": [],
    "sessionId": "your-session-id-here"
  }'
```

### Test 3: Get History
```bash
curl http://localhost:5000/api/session/your-session-id-here/history
```

### Test 4: Get Stats
```bash
curl http://localhost:5000/api/session/your-session-id-here/stats
```

## Browser Console Logs

When using the chatbot, you'll see in browser console:

```
💾 [SESSION] Creating new session
   ✅ Session created: abc-123-def-456

💾 [SESSION] Loading existing session
   Session ID: abc-123-def-456
   📚 Loaded 5 previous messages
```

## Future Enhancements

### Authentication (Coming Soon)
- User accounts
- Multiple sessions per user
- Session sharing
- Privacy controls

### LangChain Integration
- Can add LangChain.js for advanced memory management
- Conversation summarization
- Context window optimization
- Long-term memory

## Database Migration

Currently using JSON file storage. Can easily migrate to:
- **MongoDB** - For production
- **PostgreSQL** - For relational data
- **Redis** - For fast session storage

## Security Notes

⚠️ **Current Implementation:**
- Sessions stored locally in JSON file
- No authentication (anyone with session ID can access)
- Suitable for development/testing

🔒 **For Production:**
- Add authentication middleware
- Encrypt sensitive data
- Use proper database (MongoDB/PostgreSQL)
- Add rate limiting per session
- Implement session expiration

---

**Your chatbot now remembers conversations!** 🎉

Try it:
1. Open chatbot
2. Send some messages
3. Close browser
4. Reopen chatbot
5. Your conversation history is restored!


