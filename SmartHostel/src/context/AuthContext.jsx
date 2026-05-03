import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Optionally refresh from API
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (e) {
          // Token may be expired
        }
      }
    } catch (err) {
      console.log('Session restore error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: tk, user: u } = res.data;
    await AsyncStorage.setItem('token', tk);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setToken(tk);
    setUser(u);
    return u;
  };

  const register = async (name, email, password, role, phone) => {
    const res = await authAPI.register({ name, email, password, role, phone });
    const { token: tk, user: u } = res.data;
    await AsyncStorage.setItem('token', tk);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setToken(tk);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
