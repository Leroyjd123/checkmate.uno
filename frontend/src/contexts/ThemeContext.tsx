'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Theme } from '@/types/game';
import { usersAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuth();

  const applyTheme = useCallback((themeValue: Theme) => {
    const root = document.documentElement;

    switch (themeValue) {
      case 'dark':
        root.classList.remove('light-theme', 'neon-theme');
        root.classList.add('dark-theme');
        break;

      case 'neon':
        root.classList.remove('light-theme', 'dark-theme');
        root.classList.add('neon-theme');
        break;

      case 'light':
      default:
        root.classList.remove('dark-theme', 'neon-theme');
        root.classList.add('light-theme');
        break;
    }
  }, []);

  // Load theme from localStorage and user preferences
  useEffect(() => {
    const localTheme = localStorage.getItem('theme_preference') as Theme | null;
    const themeToUse = localTheme || user?.theme_preference || 'light';

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(themeToUse);
    applyTheme(themeToUse);
    setIsHydrated(true);
  }, [user, applyTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme_preference', newTheme);
    applyTheme(newTheme);

    // Sync with backend if user is authenticated
    if (user) {
      usersAPI.updateTheme(newTheme).catch(err => {
        console.error('Failed to sync theme preference:', err);
      });
    }
  }, [user, applyTheme]);

  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
