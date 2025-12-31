import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem('admin_authenticated');
      const pin = sessionStorage.getItem('admin_pin');
      const name = sessionStorage.getItem('admin_name');
      const role = sessionStorage.getItem('admin_role');

      if (authStatus === 'true' && pin) {
        setIsAuthenticated(true);
        setUser({ name, role, pin });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (pin) => {
    try {
      const response = await axios.post(`${API}/admin/verify`, { pin });
      
      if (response.data.success) {
        const { actor_name, actor_role } = response.data;
        
        // Store in session
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_pin', pin);
        sessionStorage.setItem('admin_name', actor_name || 'Admin');
        sessionStorage.setItem('admin_role', actor_role || 'operator');

        // Update state
        setIsAuthenticated(true);
        setUser({
          name: actor_name || 'Admin',
          role: actor_role || 'operator',
          pin
        });

        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Invalid PIN' 
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_pin');
    sessionStorage.removeItem('admin_name');
    sessionStorage.removeItem('admin_role');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};