/**
 * Test Chatbot API
 * Run this to test if the backend chatbot API is working
 * 
 * Usage: node test-chatbot-api.js
 */

const API_BASE_URL = process.env.API_URL || 'https://web-production-cdbe.up.railway.app';

console.log('🧪 Testing Chatbot API');
console.log('='.repeat(60));
console.log(`📍 API Base URL: ${API_BASE_URL}`);
console.log('');

// Test 1: Health Check
async function testHealth() {
  console.log('1️⃣  Testing Health Endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Health Check: PASSED');
      console.log(`   Status: ${data.status}`);
      console.log(`   OpenAI: ${data.openai || 'N/A'}`);
      console.log(`   MongoDB: ${data.mongodb || 'N/A'}`);
    } else {
      console.log('   ❌ Health Check: FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Health Check: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

// Test 2: Chatbot Health
async function testChatbotHealth() {
  console.log('2️⃣  Testing Chatbot Health Endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/chatbot/health`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('   ✅ Chatbot Health: PASSED');
      console.log(`   Model: ${data.model || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
    } else {
      console.log('   ❌ Chatbot Health: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, data);
    }
  } catch (error) {
    console.log('   ❌ Chatbot Health: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

// Test 3: Send Chat Message
async function testChatMessage() {
  console.log('3️⃣  Testing Chat Message Endpoint...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, what is 2+2?',
        conversationHistory: [],
        sessionId: null
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.message) {
      console.log('   ✅ Chat Message: PASSED');
      console.log(`   Response: "${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}"`);
      console.log(`   Model: ${data.model || 'N/A'}`);
      if (data.usage) {
        console.log(`   Tokens: ${data.usage.total_tokens || 0}`);
      }
    } else {
      console.log('   ❌ Chat Message: FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
      console.log(`   Response:`, data);
    }
  } catch (error) {
    console.log('   ❌ Chat Message: ERROR');
    console.log(`   Error: ${error.message}`);
    if (error.cause) {
      console.log(`   Cause: ${error.cause}`);
    }
  }
  console.log('');
}

// Test 4: CORS Check
async function testCORS() {
  console.log('4️⃣  Testing CORS Configuration...');
  try {
    // Test OPTIONS request (preflight)
    const optionsResponse = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://educationcopoilet.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    
    if (optionsResponse.ok || optionsResponse.status === 204) {
      console.log('   ✅ CORS Preflight (OPTIONS): PASSED');
      console.log(`   Status: ${optionsResponse.status}`);
      
      // Check CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers'),
      };
      
      console.log('   CORS Headers:');
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`     ${key}: ${value}`);
        }
      });
    } else {
      console.log('   ⚠️  CORS Preflight: WARNING');
      console.log(`   Status: ${optionsResponse.status}`);
    }
  } catch (error) {
    console.log('   ❌ CORS Test: ERROR');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

// Run all tests
async function runTests() {
  await testHealth();
  await testChatbotHealth();
  await testCORS();
  await testChatMessage();
  
  console.log('='.repeat(60));
  console.log('✅ Tests Complete!');
  console.log('');
  console.log('📋 Summary:');
  console.log('   - If all tests pass, your backend is working correctly');
  console.log('   - If tests fail, check Railway logs for errors');
  console.log('   - Make sure all environment variables are set in Railway');
}

// Run tests
runTests().catch(console.error);

