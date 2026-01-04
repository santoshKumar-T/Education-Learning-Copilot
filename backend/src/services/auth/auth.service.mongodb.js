/**
 * Auth Service (MongoDB)
 * Handles user authentication using MongoDB through database middleware
 */

import User from '../../models/User.js';
import jwt from 'jsonwebtoken';
import { dbQuery, dbWrite, safeDbOperation } from '../../middleware/database/index.js';

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
  return dbWrite(async () => {
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

    // Convert to JSON (password already excluded by schema transform)
    const userJSON = user.toObject();
    delete userJSON.password;

    return {
      user: userJSON,
      token
    };
  }, {
    operationName: 'Register User',
  }).then(result => result.data);
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  return dbWrite(async () => {
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

    // Convert to JSON (password already excluded by schema transform)
    const userJSON = user.toObject();
    delete userJSON.password;

    return {
      user: userJSON,
      token
    };
  }, {
    operationName: 'Login User',
  }).then(result => result.data);
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  return safeDbOperation(async () => {
    const user = await User.findById(userId);
    return user;
  }, {
    operationName: 'Get User By ID',
  }).then(result => result?.data || null);
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  return safeDbOperation(async () => {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  }, {
    operationName: 'Get User By Email',
  }).then(result => result?.data || null);
};

/**
 * Add session to user
 */
export const addSessionToUser = async (userId, sessionId) => {
  return safeDbOperation(async () => {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    user.addSession(sessionId);
    await user.save();
    return true;
  }, {
    operationName: 'Add Session To User',
  }).then(result => result?.data || false);
};

/**
 * Get user sessions
 */
export const getUserSessions = async (userId) => {
  return safeDbOperation(async () => {
    const user = await User.findById(userId).populate('sessions');
    if (!user) {
      return [];
    }
    return user.sessions || [];
  }, {
    operationName: 'Get User Sessions',
  }).then(result => result?.data || []);
};
