import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details if token is present
  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch current user profile:', err);
      // Token might be invalid/expired and refresh failed
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    // Listen for forced session expiry from axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [fetchCurrentUser]);

  // Login handler
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Fetch user profile immediately after getting tokens
      const profileResponse = await api.get('/auth/me/');
      setUser(profileResponse.data);
      return { success: true, user: profileResponse.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password';
      return { success: false, error: errorMessage };
    }
  };

  // Register handler
  const register = async (username, email, password, passwordConfirm) => {
    try {
      await api.post('/auth/register/', {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });

      // Automatically log in after registration
      return await login(username, password);
    } catch (error) {
      let errorMessage = 'Registration failed. Please check your inputs.';
      if (error.response?.status === 500) {
        errorMessage = 'Internal Server Error (500). The database may not be migrated or connected.';
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData.startsWith('<') 
            ? `Server error (${error.response.status}). Please check backend service.` 
            : errorData;
        } else if (typeof errorData === 'object') {
          const keys = Object.keys(errorData);
          if (keys.length > 0) {
            const firstKey = keys[0];
            const firstVal = errorData[firstKey];
            const detail = Array.isArray(firstVal) ? firstVal[0] : firstVal;
            errorMessage = `${firstKey}: ${detail}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
