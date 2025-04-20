
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'light' | 'steel' | 'midnight' | 'vibrant' | 'natural';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Default to 'light' theme (Mode 1)
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add transition class for smooth theme changes
    document.documentElement.classList.add('theme-transition');
    
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);

    return () => clearTimeout(timer);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
