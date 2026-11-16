import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('spliteasy_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth session on startup
  const checkAuth = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('spliteasy_token');
        setToken(null);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('spliteasy_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register
  const register = async (userData) => {
    const data = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('spliteasy_token', data.token);
      setToken(data.token);
    }
    setUser(data.user);
    return data;
  };

  // Login
  const login = async (credentials) => {
    const data = await api.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('spliteasy_token', data.token);
      setToken(data.token);
    }
    setUser(data.user);
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('spliteasy_token');
      setToken(null);
      setUser(null);
    }
  };

  // Update User Profile state
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
