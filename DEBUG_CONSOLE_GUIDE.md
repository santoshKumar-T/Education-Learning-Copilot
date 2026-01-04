# Debug Console Guide - Chatbot API Key Usage

## What You'll See in the Console

When you make requests to the chatbot, you'll now see detailed debug output in your server console (where `npm run dev` is running).

### Example Console Output:

```
🌐 [2024-12-21T13:20:00.000Z] POST /api/chatbot/message

📨 [REQUEST] New Chatbot Message
   Request ID: abc123
   Timestamp: 2024-12-21T13:20:00.000Z
   IP: ::1
   📝 Message: "What is 2+2?"
   💬 History Length: 0 messages
   🔄 Processing request...

🤖 [CHATBOT] Starting OpenAI API Call
   ✅ API Key: sk-proj-rNHC30Gz... (164 chars)
   Model: gpt-3.5-turbo
   Temperature: 0.7
   Max Tokens: 1000
   User Message: "What is 2+2?"
   Conversation History: 1 messages
   📡 Calling OpenAI API...
   ✅ OpenAI API Response Received
   ⏱️  Response Time: 1143ms
   📊 Model Used: gpt-3.5-turbo-0125
   💬 Response: "The answer is 4."
   🎯 Token Usage:
      - Prompt Tokens: 257
      - Completion Tokens: 15
      - Total Tokens: 272
   ✅ Request completed successfully

   ✅ [RESPONSE] Request abc123 completed successfully
   📤 Sending response to client
```

## What Each Section Shows:

### 1. **Request Information** 📨
- Request ID (unique identifier)
- Timestamp
- Client IP address
- User message preview
- Conversation history length

### 2. **API Key Status** 🔑
- ✅ Shows API key preview (first 15 chars)
- Shows total key length
- Confirms key is loaded

### 3. **OpenAI Configuration** ⚙️
- Model being used
- Temperature setting
- Max tokens limit

### 4. **API Call Progress** 📡
- When API call starts
- Response time (network latency)
- Model actually used by OpenAI

### 5. **Token Usage** 🎯
- Prompt tokens (input)
- Completion tokens (output)
- Total tokens (cost calculation)

### 6. **Response Details** 💬
- Preview of AI response
- Success/failure status

## How to View Debug Logs:

### Method 1: Terminal/Console
1. Open the terminal where you ran `npm run dev`
2. Keep it visible while testing
3. Make requests from frontend or API
4. Watch the logs appear in real-time

### Method 2: Test via API
```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","conversationHistory":[]}'
```

Then check your server console for the debug output.

### Method 3: Test via Frontend
1. Open http://localhost:3000
2. Click the chat button
3. Send a message
4. Watch the server console for logs

## Error Debugging:

If there's an error, you'll see:

```
❌ [CHATBOT] OpenAI API Error:
   Error Type: APIError
   Error Message: Invalid API key
   🔑 API Key Issue: Invalid or unauthorized
   💡 Check: Is your API key correct in .env file?
```

## What to Look For:

✅ **Good Signs:**
- API key shows with preview
- Response time: 500ms - 3000ms
- Token usage reported
- Model name: `gpt-3.5-turbo-0125` or similar

❌ **Warning Signs:**
- "API Key: NOT SET"
- Instant response (< 50ms) - might be cached
- No token usage
- Error messages

## Tips:

1. **Keep Console Visible**: Keep your server terminal open while testing
2. **Watch for Errors**: Red error messages will show API issues
3. **Monitor Token Usage**: Track costs by watching token counts
4. **Check Response Times**: Slow responses indicate network issues
5. **Verify API Key**: First log shows if key is loaded correctly

## Example: Full Request Flow

```
1. Request arrives → 📨 [REQUEST] appears
2. API key checked → ✅ API Key: sk-proj-... shown
3. OpenAI called → 📡 Calling OpenAI API...
4. Response received → ✅ OpenAI API Response Received
5. Tokens counted → 🎯 Token Usage shown
6. Response sent → ✅ [RESPONSE] completed
```

---

**Now restart your server and watch the console!** 🎉




