'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { BoardTheme, DEFAULT_THEME } from '@/lib/board-themes';

interface BoardThemeContextType {
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
}

const BoardThemeContext = createContext<BoardThemeContextType | undefined>(undefined);

export function BoardThemeProvider({ children }: { children: React.ReactNode }) {
  const [boardTheme, setBoardThemeState] = useState<BoardTheme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // Load board theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('board-theme') as BoardTheme | null;
    if (savedTheme) {
      setBoardThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Save board theme to localStorage when it changes
  const setBoardTheme = (newTheme: BoardTheme) => {
    setBoardThemeState(newTheme);
    localStorage.setItem('board-theme', newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <BoardThemeContext.Provider value={{ boardTheme, setBoardTheme }}>
      {children}
    </BoardThemeContext.Provider>
  );
}

export function useBoardTheme(): BoardThemeContextType {
  const context = useContext(BoardThemeContext);
  if (!context) {
    // Return default during SSR/hydration
    return {
      boardTheme: DEFAULT_THEME,
      setBoardTheme: () => {},
    };
  }
  return context;
}
