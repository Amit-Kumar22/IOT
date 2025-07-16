/**
 * Theme Provider Component
 * Provides dark mode context and theme management
 */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'iot-theme'
}) => {
  const {
    theme,
    setTheme,
    resolvedTheme,
    systemTheme
  } = useNextTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const value: ThemeContextType = {
    theme: theme as Theme,
    setTheme: setTheme as (theme: Theme) => void,
    resolvedTheme: resolvedTheme as 'light' | 'dark',
    systemTheme: systemTheme as 'light' | 'dark',
    toggleTheme
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * System Theme Detection Hook
 * Detects system preference for dark mode
 */
export const useSystemTheme = (): 'light' | 'dark' => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial value
    updateSystemTheme();

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemTheme;
};

/**
 * Theme Storage Hook
 * Provides persistent theme storage
 */
export const useThemeStorage = (key: string = 'iot-theme') => {
  const [storedTheme, setStoredTheme] = useState<Theme>('system');

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredTheme(item as Theme);
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
  }, [key]);

  const setValue = (value: Theme) => {
    try {
      setStoredTheme(value);
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  return [storedTheme, setValue] as const;
};

/**
 * Theme Transition Hook
 * Provides smooth theme transitions
 */
export const useThemeTransition = () => {
  const { resolvedTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTheme = (callback: () => void) => {
    setIsTransitioning(true);
    
    // Apply transition class
    document.documentElement.classList.add('theme-transitioning');
    
    // Execute theme change
    callback();
    
    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);
  };

  return {
    isTransitioning,
    transitionTheme
  };
};

/**
 * Theme CSS Variables Hook
 * Provides access to theme CSS variables
 */
export const useThemeVariables = () => {
  const { resolvedTheme } = useTheme();
  
  const getVariableValue = (variable: string): string => {
    if (typeof window === 'undefined') return '';
    
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(variable);
  };

  const setVariableValue = (variable: string, value: string) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    root.style.setProperty(variable, value);
  };

  return {
    theme: resolvedTheme,
    getVariableValue,
    setVariableValue
  };
};

export default ThemeProvider;
