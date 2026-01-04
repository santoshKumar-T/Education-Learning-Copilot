import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MongoDB Connection
 * Connects to MongoDB using connection string from environment variables
 */
export const connectDatabase = async () => {
  try {
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/education_copilot';
    
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    // Connect to MongoDB (don't throw error, just log it)
    try {
      await mongoose.connect(mongoUri, options);

      console.log('✅ MongoDB connected successfully');
      console.log(`   Database: ${mongoose.connection.name}`);
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Port: ${mongoose.connection.port}`);
    } catch (connectError) {
      console.warn('⚠️  MongoDB connection failed:', connectError.message);
      console.warn('   The server will continue but database features will not work.');
      console.warn('   To fix:');
      console.warn('   1. Start MongoDB: brew services start mongodb-community');
      console.warn('   2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
      console.warn('   3. Update MONGODB_URI in .env file');
      // Don't throw - let server continue without database
      return null;
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
      }
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    console.warn('⚠️  MongoDB setup error:', error.message);
    console.warn('   Server will continue without database connection');
    return null;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

