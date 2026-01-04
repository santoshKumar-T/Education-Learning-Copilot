#!/bin/bash

echo "🔍 CHATBOT LOG VIEWER"
echo "====================="
echo ""
echo "This will show you where to find the logs and test the API"
echo ""

# Check if server is running
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Server is running on port 5000"
    echo ""
    echo "📤 Making a test request..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    curl -X POST http://localhost:5000/api/chatbot/message \
      -H "Content-Type: application/json" \
      -d '{
        "message": "Hello! Can you tell me what 2+2 equals? Answer in one word.",
        "conversationHistory": []
      }' \
      -w "\n\n" \
      -s | python3 -m json.tool 2>/dev/null || echo "Response received"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 WHERE TO SEE THE LOGS:"
    echo ""
    echo "The debug logs appear in the TERMINAL where you started the server."
    echo ""
    echo "To see the logs:"
    echo "1. Find the terminal where you ran: npm run dev"
    echo "2. Look for output that starts with:"
    echo "   📨 [REQUEST] New Chatbot Message"
    echo "   🤖 [CHATBOT] Starting OpenAI API Call"
    echo "   ✅ API Key: sk-proj-..."
    echo ""
    echo "If you don't see logs, the server might be running in the background."
    echo "Try restarting it in a visible terminal window."
    echo ""
else
    echo "❌ Server is NOT running!"
    echo ""
    echo "Please start it first:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    echo "Then run this script again to see the logs."
    echo ""
fi
