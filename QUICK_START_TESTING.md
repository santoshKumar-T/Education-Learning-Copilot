# Quick Start: Testing LangChain - Step by Step

## 🎯 Goal
Test if LangChain remembers your conversation and understands context.

## ⚡ Quick Test (5 minutes)

### Prerequisites
1. Backend server running: `cd backend && npm run dev`
2. OpenAI API key configured in `.env`

### Method 1: Using the Test Script (Easiest)

```bash
cd backend
./test-langchain-simple.sh
```

This will:
- ✅ Create a session
- ✅ Send test messages
- ✅ Check if LangChain remembers
- ✅ Show you the results

### Method 2: Manual Testing (Learn How It Works)

#### Step 1: Open Terminal
Keep your server running in one terminal, open a new one.

#### Step 2: Create Session
```bash
curl -X POST http://localhost:5000/api/session/create \
  -H "Content-Type: application/json"
```

**Copy the `sessionId` from the response!**

Example response:
```json
{
  "success": true,
  "sessionId": "abc-123-def-456"
}
```

#### Step 3: Send First Message
```bash
curl -X POST http://localhost:5000/api/langchain/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! My name is John and I teach computer science.",
    "sessionId": "PASTE_SESSION_ID_HERE"
  }'
```

**Replace `PASTE_SESSION_ID_HERE` with your actual sessionId!**

#### Step 4: Test Memory
```bash
curl -X POST http://localhost:5000/api/langchain/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my name?",
    "sessionId": "PASTE_SESSION_ID_HERE"
  }'
```

**✅ If it says "Your name is John" - LangChain is working!**

#### Step 5: Test Context
```bash
curl -X POST http://localhost:5000/api/langchain/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you help me create a quiz about that subject?",
    "sessionId": "PASTE_SESSION_ID_HERE"
  }'
```

**✅ If it understands "that subject" = computer science - Context is working!**

## 🎓 What You Should See

### Successful Test Results:

**Step 3 Response:**
```json
{
  "success": true,
  "message": "Hello John! It's great to meet you...",
  "poweredBy": "LangChain"
}
```

**Step 4 Response (Memory Test):**
```json
{
  "success": true,
  "message": "Your name is John and you teach computer science.",
  "poweredBy": "LangChain"
}
```
✅ **It remembered!**

**Step 5 Response (Context Test):**
```json
{
  "success": true,
  "message": "Sure! I can help you create a quiz about computer science...",
  "poweredBy": "LangChain"
}
```
✅ **It understood context!**

## 🔍 Understanding the Results

### ✅ LangChain is Working If:
- Bot remembers your name when you ask
- Bot remembers what you said earlier
- Bot understands "that" or "it" refers to previous topics
- Response includes `"poweredBy": "LangChain"`

### ❌ Something's Wrong If:
- Bot says "I don't know" when you ask about info you just gave
- Bot asks for information you already provided
- You get error messages

## 🐛 Common Issues

### Issue: "Session ID is required"
**Fix**: Make sure you include `sessionId` in your request body.

### Issue: "Failed to generate response"
**Fix**: 
1. Check OpenAI API key in `.env`
2. Check server logs for errors
3. Make sure server is running

### Issue: Bot doesn't remember
**Fix**: 
1. Use the SAME sessionId for all messages
2. Check that session storage is working
3. Look at server console for "Saved to session" messages

## 📊 Compare: Direct OpenAI vs LangChain

### Test Both to See the Difference:

**Direct OpenAI:**
```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My name is Sarah",
    "conversationHistory": []
  }'

# Then ask: "What's my name?"
# Might forget! ❌
```

**LangChain:**
```bash
# Uses sessionId - automatically remembers! ✅
```

## 💡 Key Concepts in Simple Terms

### 1. Session
- **What**: A conversation container
- **Why**: Keeps all messages together
- **Like**: A chat room with a unique ID

### 2. Memory
- **What**: Remembering previous messages
- **Why**: So bot can reference earlier conversation
- **Like**: Having a conversation history

### 3. Context
- **What**: Understanding what "that" or "it" refers to
- **Why**: More natural conversations
- **Like**: Understanding references in a conversation

## 🎬 Visual Example

```
You: "I'm learning Python"
Bot: "Great! Python is excellent..."

You: "Can you help with that?"
Bot: "Sure! I can help with Python..." ✅ UNDERSTOOD!

vs.

You: "I'm learning Python"  
Bot: "Great! Python is excellent..."

You: "Can you help with that?"
Bot: "Help with what?" ❌ FORGOT!
```

## 📝 Practice Exercise

Try this conversation flow:

1. **Introduce yourself**: "Hi, I'm Maria, a biology teacher"
2. **Ask about yourself**: "What's my name and profession?"
3. **Ask for help**: "Can you create a lesson plan for my subject?"
4. **Follow up**: "Make it about cell biology specifically"

**Expected**: Bot should remember everything and understand context!

## 🚀 Next Steps After Testing

Once you see it working:

1. **Integrate with Frontend**: Use LangChain endpoint in your chatbot UI
2. **Compare Performance**: Test both endpoints side by side
3. **Explore Features**: Read about LangChain agents and tools
4. **Customize**: Adjust prompts and memory settings

---

**Ready?** Run the test script and see LangChain in action! 🎉

```bash
cd backend
./test-langchain-simple.sh
```


