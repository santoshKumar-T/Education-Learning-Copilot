#!/usr/bin/env node

/**
 * Start server and show logs clearly
 */

import { spawn } from 'child_process';
import fetch from 'node-fetch';

console.log('🚀 Starting server with debug logging...\n');

const server = spawn('node', ['src/server.js'], {
  cwd: process.cwd(),
  stdio: 'inherit', // This will show all output
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Server exited with code ${code}`);
  }
});

// Wait for server to start
setTimeout(async () => {
  console.log('\n🧪 Making test request to trigger logs...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/chatbot/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello! What is 2+2?',
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    console.log('\n✅ Test completed!');
    console.log('Response:', data.message?.substring(0, 50));
    console.log('\n💡 All logs should be visible above!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}, 5000);

// Keep process alive
process.on('SIGINT', () => {
  server.kill();
  process.exit();
});




