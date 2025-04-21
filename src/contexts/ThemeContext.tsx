
// Support switching between "light" and "dark" themes ONLY
import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    // Check for stored theme or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;

      // If no stored preference, check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    // Apply theme to HTML element
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      // Remove any transition class first to prevent transition on initial load
      document.documentElement.classList.remove('theme-transition');
      
      // Apply class for Tailwind dark mode
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Force a repaint to ensure the change is applied immediately
      // This helps avoid flickering on theme change
      const repaint = document.documentElement.offsetHeight;
      
      // Add transition class after a small delay to ensure smooth transitions
      // between theme changes but not on initial load
      const timer = setTimeout(() => {
        document.documentElement.classList.add('theme-transition');
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    // Add transition class before changing theme for smooth transition
    if (document.documentElement) {
      document.documentElement.classList.add('theme-transition');
    }
    setThemeState(newTheme);
  };

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
