import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/chatbot/message';

console.log('\n🧪 TESTING CHATBOT WITH DEBUG LOGS');
console.log('='.repeat(60));
console.log('Making request to:', API_URL);
console.log('Watch your server console for detailed logs!\n');

const testMessage = {
  message: "What is the capital of France? Answer in one word.",
  conversationHistory: []
};

try {
  console.log('📤 Sending request...');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testMessage)
  });

  const data = await response.json();
  
  console.log('\n✅ Response received:');
  console.log('   Success:', data.success);
  console.log('   Model:', data.model);
  console.log('   Message:', data.message?.substring(0, 100));
  if (data.usage) {
    console.log('   Tokens:', data.usage.total_tokens);
  }
  console.log('\n💡 Check your server console (where npm run dev is running)');
  console.log('   You should see detailed debug logs there!\n');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n⚠️  Make sure the server is running: npm run dev\n');
}
