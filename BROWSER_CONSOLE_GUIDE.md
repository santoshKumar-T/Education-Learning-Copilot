# Browser Console Guide - Verify OpenAI API Usage

## How to Check if Chatbot is Using Real OpenAI API from Browser Console

### Step 1: Open Browser Developer Tools

1. **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. **Safari**: Press `Cmd+Option+I` (need to enable Developer menu first)

### Step 2: Go to Console Tab

Click on the **Console** tab in the developer tools.

### Step 3: Open the Chatbot

1. Go to your website: http://localhost:3000
2. Click the chat button (bottom-right corner)
3. Watch the console - you'll see health check logs

### Step 4: Send a Message

Type a message in the chatbot and send it. You'll see detailed logs in the console.

## What You'll See in Browser Console

### When Chatbot Opens:
```
🔍 [CHATBOT] Checking service health...
🏥 [CHATBOT] Health Check
✅ Chatbot Service: Healthy
   Model: gpt-3.5-turbo-0125
   Status: healthy
```

### When You Send a Message:
```
💬 [CHATBOT UI] User sent message
   Message: "Hello"
   History: 0 messages

🤖 [CHATBOT] Sending Message to OpenAI API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 Request ID: abc123
🌐 API Endpoint: http://localhost:5000/api/chatbot/message
💬 User Message: "Hello"
📚 Conversation History: 0 previous messages
⏱️  Request started at: 1:30:45 PM
📡 Calling backend API...

✅ OpenAI API Response Received
⏱️  Total Response Time: 1234ms
🤖 Model Used: gpt-3.5-turbo-0125
🎯 Token Usage (Real OpenAI API):
   📥 Prompt Tokens: 257
   📤 Completion Tokens: 15
   📊 Total Tokens: 272
   💰 Estimated Cost: ~$0.000544
💬 Response Preview: "Hello! How can I help you..."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VERIFIED: Using REAL OpenAI API (Not Mock Data)
   Evidence:
   • Real GPT model: gpt-3.5-turbo-0125
   • Token usage tracked: 272 tokens
   • Network latency: 1234 ms

✅ [CHATBOT UI] Response received
   Model: gpt-3.5-turbo-0125
   Tokens: 272
```

## How to Verify It's Real OpenAI

### ✅ Signs of REAL OpenAI API:

1. **Model Name**: Shows `gpt-3.5-turbo-0125`, `gpt-4`, or similar
2. **Token Usage**: Shows actual token counts (prompt + completion)
3. **Response Time**: 500ms - 3000ms (network latency)
4. **Cost Estimate**: Shows estimated cost based on tokens
5. **Verification Message**: Green "VERIFIED: Using REAL OpenAI API"

### ❌ Signs of Mock Data (NOT your case):

1. No model name or generic name
2. No token usage
3. Instant response (< 50ms)
4. No cost estimate
5. Generic pre-written responses

## Quick Verification Test

1. Open browser console (F12)
2. Send message: "What is 2+2? Answer in one word."
3. Look for in console:
   - ✅ Model: `gpt-3.5-turbo-0125`
   - ✅ Token Usage: Numbers shown
   - ✅ Response Time: > 500ms
   - ✅ Green verification message

## Network Tab Verification (Advanced)

You can also check the Network tab:

1. Open Developer Tools → **Network** tab
2. Send a message in chatbot
3. Look for request to `/api/chatbot/message`
4. Click on it → Go to **Response** tab
5. You should see:
   ```json
   {
     "success": true,
     "message": "...",
     "model": "gpt-3.5-turbo-0125",
     "usage": {
       "prompt_tokens": 257,
       "completion_tokens": 15,
       "total_tokens": 272
     }
   }
   ```

## Console Commands for Testing

You can also test directly from console:

```javascript
// Test the API directly
fetch('http://localhost:5000/api/chatbot/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    conversationHistory: []
  })
})
.then(r => r.json())
.then(data => {
  console.log('Model:', data.model);
  console.log('Tokens:', data.usage?.total_tokens);
  console.log('Is Real OpenAI?', data.model?.includes('gpt') && data.usage);
});
```

## Troubleshooting

### If you don't see logs:
1. Make sure console is open (F12)
2. Check if console filter is set to show all messages
3. Try refreshing the page
4. Check if there are any console errors

### If you see errors:
- Check backend server is running
- Verify API endpoint is correct
- Check network tab for failed requests

---

**Now open your browser console and test the chatbot!** 🎉




