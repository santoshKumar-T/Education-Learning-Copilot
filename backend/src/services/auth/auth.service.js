import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { User } from '../../models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const usersDbPath = path.join(__dirname, '../../../data/users.json');

// Default data structure
const defaultUsersData = {
  users: {},
  lastUpdated: new Date().toISOString()
};

// Database instance
let usersDb = null;

/**
 * Initialize users database
 */
export const initializeUsersDB = async () => {
  try {
    const dataDir = path.dirname(usersDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const adapter = new JSONFile(usersDbPath);
    usersDb = new Low(adapter, defaultUsersData);
    await usersDb.read();
    usersDb.data = usersDb.data || defaultUsersData;
    await usersDb.write();
    
    console.log('✅ Users database initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing users database:', error);
    return false;
  }
};

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { 
      userId, 
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
export const registerUser = async (email, password, name) => {
  if (!usersDb) {
    await initializeUsersDB();
  }

  await usersDb.read();

  // Check if user already exists
  const existingUser = Object.values(usersDb.data.users || {}).find(
    user => user.email.toLowerCase() === email.toLowerCase()
  );

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

  // Create new user
  const userId = uuidv4();
  const hashedPassword = await hashPassword(password);
  
  const user = new User({
    id: userId,
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || email.split('@')[0],
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    sessions: []
  });

  // Save user as plain object to ensure password is persisted
  usersDb.data.users[userId] = {
    id: user.id,
    email: user.email,
    password: user.password, // Ensure password is saved
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    isActive: user.isActive,
    sessions: user.sessions
  };
  usersDb.data.lastUpdated = new Date().toISOString();
  await usersDb.write();

  console.log(`✅ User registered: ${email}`);

  // Generate token
  const token = generateToken(userId, email);

  return {
    user: user.toPublicJSON(),
    token
  };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  if (!usersDb) {
    await initializeUsersDB();
  }

  await usersDb.read();

  // Find user by email
  const userData = Object.values(usersDb.data.users || {}).find(
    user => user.email.toLowerCase() === email.toLowerCase()
  );

  if (!userData) {
    throw new Error('Invalid email or password');
  }

  const user = new User(userData);

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  // Save user as plain object to ensure password is persisted
  usersDb.data.users[user.id] = {
    id: user.id,
    email: user.email,
    password: user.password, // Ensure password is saved
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    isActive: user.isActive,
    sessions: user.sessions
  };
  usersDb.data.lastUpdated = new Date().toISOString();
  await usersDb.write();

  console.log(`✅ User logged in: ${email}`);

  // Generate token
  const token = generateToken(user.id, user.email);

  return {
    user: user.toPublicJSON(),
    token
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  if (!usersDb) {
    await initializeUsersDB();
  }

  await usersDb.read();
  const userData = usersDb.data.users[userId];

  if (!userData) {
    return null;
  }

  return new User(userData);
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  if (!usersDb) {
    await initializeUsersDB();
  }

  await usersDb.read();
  const userData = Object.values(usersDb.data.users || {}).find(
    user => user.email.toLowerCase() === email.toLowerCase()
  );

  if (!userData) {
    return null;
  }

  return new User(userData);
};

/**
 * Add session to user
 */
export const addSessionToUser = async (userId, sessionId) => {
  if (!usersDb) {
    await initializeUsersDB();
  }

  await usersDb.read();
  const userData = usersDb.data.users[userId];

  if (!userData) {
    return false;
  }

  const user = new User(userData);
  if (!user.sessions.includes(sessionId)) {
    user.sessions.push(sessionId);
    user.updatedAt = new Date().toISOString();
    // Save user as plain object to ensure password is persisted
    usersDb.data.users[userId] = {
      id: user.id,
      email: user.email,
      password: user.password, // Ensure password is saved
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      sessions: user.sessions
    };
    usersDb.data.lastUpdated = new Date().toISOString();
    await usersDb.write();
  }

  return true;
};

/**
 * Get user sessions
 */
export const getUserSessions = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    return [];
  }
  return user.sessions || [];
};

