/**
 * Create Test User Script
 * Run this to create a test user for local development
 * 
 * Usage: node src/scripts/create-test-user.js
 */

import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    console.log('🔧 Creating test user...\n');

    // Connect to database
    await connectDatabase();

    // Test user credentials
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User'
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log('\n📋 Login Credentials:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      console.log('\n💡 You can use these credentials to login.');
      process.exit(0);
    }

    // Create new user
    const user = new User({
      email: testUser.email,
      password: testUser.password,
      name: testUser.name,
      role: 'user'
    });

    await user.save();

    console.log('✅ Test user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    console.log('\n💡 You can now use these credentials to login.');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start your frontend: cd frontend && npm run dev');
    console.log('   2. Go to http://localhost:3000');
    console.log('   3. Click "Login / Sign Up"');
    console.log('   4. Use the credentials above to login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    if (error.code === 11000) {
      console.log('\n💡 User already exists. Use the credentials above to login.');
    }
    process.exit(1);
  }
};

// Run the script
createTestUser();

