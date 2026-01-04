#!/bin/bash

echo "🧪 Testing Chatbot API and Showing Logs"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "❌ Server is not running!"
    echo ""
    echo "Please start the server first:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "✅ Server is running"
echo ""
echo "📤 Making test request..."
echo ""

# Make the request and show response
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! What is 2+2? Answer in one word only.",
    "conversationHistory": []
  }' \
  -w "\n\n⏱️  Response Time: %{time_total}s\n" \
  -s | python3 -m json.tool 2>/dev/null || curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! What is 2+2?","conversationHistory":[]}' -s

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 IMPORTANT: Check your SERVER CONSOLE (where you ran 'npm run dev')"
echo "   You should see detailed debug logs there showing:"
echo "   • API key status"
echo "   • Request details"
echo "   • OpenAI API call"
echo "   • Token usage"
echo "   • Response time"
echo ""
echo "   The logs appear in the TERMINAL where the server is running,"
echo "   NOT in this output!"
echo ""




