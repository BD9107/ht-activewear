import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      await axios.get(`${API}/verify`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      });
      setToken(tokenToVerify);
      setIsAuthenticated(true);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('authToken');
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password) => {
    try {
      const response = await axios.post(`${API}/login`, { password });
      const { access_token } = response.data;
      
      localStorage.setItem('authToken', access_token);
      setToken(access_token);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setIsAuthenticated(false);
  };

  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      login, 
      logout,
      getAuthHeader,
      token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
