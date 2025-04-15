
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'steel' | 'midnight' | 'vibrant';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    // Try to get the saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme || 'steel'; // Default to 'steel' if no theme is saved
  });

  useEffect(() => {
    // Save theme to localStorage and update document attribute
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add a transition class for smooth theme changes
    document.documentElement.classList.add('theme-transition');
    
    // Remove the transition class after the transition is complete
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
