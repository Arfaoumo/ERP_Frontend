import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
export const AuthContext = createContext();
export const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    try {
      const {
        data
      } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        email,
        password
      });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  return <AuthContext.Provider value={{
    user,
    loading,
    login,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
};