import * as authService from '../services/auth/auth.service.mongodb.js';
const { registerUser, loginUser, getUserById } = authService;

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Register user
    const result = await registerUser(email, password, name);

    console.log(`✅ User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Login user
    const result = await loginUser(email, password);

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires authentication
 */
export const getCurrentUser = async (req, res) => {
  try {
    // User is attached by auth middleware
    const user = await getUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user'
    });
  }
};

/**
 * Verify token
 * GET /api/auth/verify
 */
export const verify = async (req, res) => {
  try {
    // If we reach here, token is valid (middleware verified it)
    res.json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

