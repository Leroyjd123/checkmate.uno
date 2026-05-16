'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getAuthToken } from '@/lib/api';
import { User } from '@/types/game';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        setUser({
          id: response.user.id,
          email: response.user.email,
          theme_preference: (response.user.theme_preference as 'light' | 'dark' | 'neon') || 'light',
          created_at: new Date().toISOString(),
        });
        setError(null);
      } catch (err) {
        console.error('Auth check failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Clear invalid token
        document.cookie = 'auth_token=; path=/; max-age=0';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(email, password);

      // Token should be set in httpOnly cookie by backend
      setUser({
        id: response.user.id,
        email: response.user.email,
        theme_preference: 'light',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);

      // Token should be set in httpOnly cookie by backend
      setUser({
        id: response.user.id,
        email: response.user.email,
        theme_preference: 'light',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    // Clear token cookie
    document.cookie = 'auth_token=; path=/; max-age=0';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
