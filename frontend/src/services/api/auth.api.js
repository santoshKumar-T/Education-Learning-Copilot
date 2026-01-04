const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name (optional)
 * @returns {Promise<Object>} User data and token
 */
export const register = async (email, password, name = '') => {
  try {
    console.log('%c🔐 [AUTH] Registering user', 'color: #8b5cf6; font-weight: bold;');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('%c✅ [AUTH] Registration successful', 'color: #10b981; font-weight: bold;');
      console.log(`   User: ${data.user.email}`);
    }
    
    return data;
  } catch (error) {
    console.error('%c❌ [AUTH] Registration failed:', 'color: #ef4444; font-weight: bold;', error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (email, password) => {
  try {
    console.log('%c🔐 [AUTH] Logging in', 'color: #8b5cf6; font-weight: bold;');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('%c✅ [AUTH] Login successful', 'color: #10b981; font-weight: bold;');
      console.log(`   User: ${data.user.email}`);
    }
    
    return data;
  } catch (error) {
    console.error('%c❌ [AUTH] Login failed:', 'color: #ef4444; font-weight: bold;', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  localStorage.removeItem('chatbot_session_id');
  console.log('%c🔐 [AUTH] Logged out', 'color: #8b5cf6; font-weight: bold;');
};

/**
 * Get current user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      // Token might be invalid, clear it
      if (response.status === 401) {
        logout();
      }
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get auth token
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};


