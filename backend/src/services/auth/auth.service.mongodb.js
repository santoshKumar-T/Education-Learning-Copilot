import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Check if MongoDB is connected
 */
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

/**
 * Generate JWT token
 */
export const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { 
      userId: userId.toString(), 
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    secret,
    { expiresIn }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Register a new user
 */
export const registerUser = async (email, password, name = '') => {
  try {
    // Check MongoDB connection
    if (!isMongoConnected()) {
      throw new Error('Database not connected. Please start MongoDB or configure MongoDB Atlas connection.');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      email: email.toLowerCase(),
      password, // Will be hashed automatically
      name: name || email.split('@')[0],
      role: 'user',
      isActive: true,
      sessions: []
    });

    await user.save();

    console.log(`✅ User registered: ${email}`);

    // Generate token
    const token = generateToken(user._id, user.email);

    return {
      user: user.toJSON(), // Password excluded by schema transform
      token
    };
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error
      throw new Error('User with this email already exists');
    }
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  try {
    // Check MongoDB connection
    if (!isMongoConnected()) {
      throw new Error('Database not connected. Please start MongoDB or configure MongoDB Atlas connection.');
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password'); // Include password field

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ User logged in: ${email}`);

    // Generate token
    const token = generateToken(user._id, user.email);

    return {
      user: user.toJSON(), // Password excluded by schema transform
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    if (!isMongoConnected()) {
      return null;
    }
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  try {
    if (!isMongoConnected()) {
      return null;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    return null;
  }
};

/**
 * Add session to user
 */
export const addSessionToUser = async (userId, sessionId) => {
  try {
    if (!isMongoConnected()) {
      return false;
    }
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    user.addSession(sessionId);
    await user.save();
    return true;
  } catch (error) {
    console.error('Error adding session to user:', error);
    return false;
  }
};

/**
 * Get user sessions
 */
export const getUserSessions = async (userId) => {
  try {
    if (!isMongoConnected()) {
      return [];
    }
    const user = await User.findById(userId).populate('sessions');
    if (!user) {
      return [];
    }
    return user.sessions || [];
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

