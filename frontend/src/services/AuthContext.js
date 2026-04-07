import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    console.log('🔐 Frontend Login Attempt:', { email, password: '***' });
    try {
      const response = await authService.login(email, password);
      console.log('✅ Login API Response:', response);
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      console.log('🎉 Login State Updated:', { token: '***', user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('❌ Login Error:', error);
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    console.log('🔐 Frontend Signup Attempt:', { name, email, password: '***' });
    try {
      const response = await authService.signup(name, email, password);
      console.log('✅ Signup API Response:', response);
      return { success: true };
    } catch (error) {
      console.error('❌ Signup Error:', error);
      return { success: false, error: error.response?.data || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
