#!/bin/bash

echo "🧪 LangChain Testing Guide"
echo "=========================="
echo ""
echo "This script will help you test LangChain step by step"
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

# Step 1: Create Session
echo "📝 Step 1: Creating a new session..."
echo "-----------------------------------"
SESSION_RESPONSE=$(curl -s -X POST http://localhost:5000/api/session/create \
  -H "Content-Type: application/json")

echo "$SESSION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SESSION_RESPONSE"
echo ""

# Extract session ID
SESSION_ID=$(echo "$SESSION_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('sessionId', ''))" 2>/dev/null)

if [ -z "$SESSION_ID" ]; then
    echo "❌ Failed to create session. Please check server logs."
    exit 1
fi

echo "✅ Session ID: $SESSION_ID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: First Message
echo "💬 Step 2: Sending first message (introducing yourself)..."
echo "-----------------------------------------------------------"
echo "Message: 'Hello! My name is Alice and I am a math teacher.'"
echo ""

RESPONSE1=$(curl -s -X POST http://localhost:5000/api/langchain/message \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Hello! My name is Alice and I am a math teacher.\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$RESPONSE1" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE1"
echo ""

BOT_RESPONSE1=$(echo "$RESPONSE1" | python3 -c "import sys, json; print(json.load(sys.stdin).get('message', '')[:100])" 2>/dev/null)
echo "Bot said: $BOT_RESPONSE1..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Test Memory
echo "🧠 Step 3: Testing Memory (asking about information from Step 2)..."
echo "-------------------------------------------------------------------"
echo "Message: 'What is my name and what do I teach?'"
echo ""
echo "💡 This tests if LangChain REMEMBERS what you said!"
echo ""

RESPONSE2=$(curl -s -X POST http://localhost:5000/api/langchain/message \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"What is my name and what do I teach?\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$RESPONSE2" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE2"
echo ""

BOT_RESPONSE2=$(echo "$RESPONSE2" | python3 -c "import sys, json; print(json.load(sys.stdin).get('message', ''))" 2>/dev/null)
echo "Bot said: $BOT_RESPONSE2"
echo ""

# Check if it remembered
if echo "$BOT_RESPONSE2" | grep -qi "alice\|math"; then
    echo "✅ SUCCESS! LangChain REMEMBERED your name and profession!"
else
    echo "⚠️  Hmm, it might not have remembered. Check the response above."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Test Context
echo "🎯 Step 4: Testing Context Understanding..."
echo "------------------------------------------"
echo "Message: 'Can you help me create a lesson plan for that subject?'"
echo ""
echo "💡 This tests if LangChain UNDERSTANDS 'that subject' = math"
echo ""

RESPONSE3=$(curl -s -X POST http://localhost:5000/api/langchain/message \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Can you help me create a lesson plan for that subject?\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$RESPONSE3" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE3"
echo ""

BOT_RESPONSE3=$(echo "$RESPONSE3" | python3 -c "import sys, json; print(json.load(sys.stdin).get('message', '')[:150])" 2>/dev/null)
echo "Bot said: $BOT_RESPONSE3..."
echo ""

# Check if it understood context
if echo "$BOT_RESPONSE3" | grep -qi "math"; then
    echo "✅ SUCCESS! LangChain UNDERSTOOD the context!"
else
    echo "⚠️  Check if it understood 'that subject' refers to math."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 TEST SUMMARY"
echo "==============="
echo ""
echo "Session ID: $SESSION_ID"
echo ""
echo "What we tested:"
echo "  1. ✅ Session creation"
echo "  2. ✅ Sending message with LangChain"
echo "  3. ✅ Memory (does it remember your name?)"
echo "  4. ✅ Context (does it understand 'that subject'?)"
echo ""
echo "💡 Key Takeaway:"
echo "   LangChain helps the bot REMEMBER and UNDERSTAND context"
echo "   better than direct OpenAI calls."
echo ""
echo "📁 Your conversation is saved in:"
echo "   backend/data/conversations.json"
echo ""
echo "🔄 To test again with a new conversation:"
echo "   Run this script again (it will create a new session)"
echo ""


