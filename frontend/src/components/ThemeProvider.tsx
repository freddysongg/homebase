'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

// Add script to prevent theme flash
const themeScript = `
  (function() {
    // Try to get theme from localStorage
    let theme = localStorage.getItem('theme');
    if (!theme) {
      // If no theme in localStorage, check system preference
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Immediately set the theme before page renders
    document.documentElement.classList.add(theme);
  })();
`;

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  // Add script to head to prevent theme flash
  useEffect(() => {
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = themeScript;
    document.head.appendChild(scriptElement);
    return () => {
      document.head.removeChild(scriptElement);
    };
  }, []);

  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decodedToken = jwtDecode(token) as { id: string };
        const userId = decodedToken.id;

        const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) return;

        const userData = await response.json();
        if (userData.data?.preferences?.theme) {
          setTheme(userData.data.preferences.theme);
        }
      } catch (error) {
        console.error('Error fetching user theme:', error);
      } finally {
        setMounted(true);
      }
    };

    fetchUserTheme();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Apply appropriate theme
    if (theme === 'system') {
      root.classList.add(systemTheme ? 'dark' : 'light');
      localStorage.setItem('theme', systemTheme ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }

    // Add listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
        localStorage.setItem('theme', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};