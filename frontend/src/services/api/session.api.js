const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get current user's sessions
 * @returns {Promise<Array>} User's sessions
 */
export const getMySessions = async () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return [];
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/my-sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Get recent sessions (for recovery)
 * @returns {Promise<Array>} Recent sessions
 */
export const getRecentSessions = async () => {
  const token = localStorage.getItem('auth_token');
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/session/recent`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    return [];
  }
};
