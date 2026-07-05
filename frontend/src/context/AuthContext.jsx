import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.success) {
            setUser(res.data.data);
            setIsAuthenticated(true);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Failed to load user session', err);
          handleLogout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, role: userData.role };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const handleAdminLogin = async (email, password) => {
    try {
      const res = await authAPI.adminLogin({ email, password });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, role: userData.role };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Admin login failed.',
      };
    }
  };

  const handleRegister = async (name, email, password, phone, role = 'citizen', adminAccessKey = '') => {
    try {
      const res = await authAPI.register({ name, email, password, phone, role, adminAccessKey });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, role: userData.role };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try again.',
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserInfo = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login: handleLogin,
        adminLogin: handleAdminLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
