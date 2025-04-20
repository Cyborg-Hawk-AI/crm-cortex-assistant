
// Only provide a single 'light' theme
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'light';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<ThemeType>('light');

  useEffect(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.add('theme-transition');
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Do nothing on setTheme—theme is always 'light'
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
