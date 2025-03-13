'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

// Add script to prevent theme flash
const themeScript = `
  (function() {
    let theme = localStorage.getItem('theme');
    if (!theme) {
      theme = 'light';
      localStorage.setItem('theme', 'light');
    }
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or user preferences
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // No token means user is not logged in, use localStorage or default
          const savedTheme = localStorage.getItem('theme') || 'light';
          setTheme(savedTheme as 'light' | 'dark' | 'system');
          return;
        }

        // Get user ID from token
        const decodedToken = jwtDecode(token) as { id: string };
        const userId = decodedToken.id;

        const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user theme');

        const userData = await response.json();
        const userTheme = userData.data?.preferences?.theme || 'light';

        setTheme(userTheme);
        localStorage.setItem('theme', userTheme);
      } catch (error) {
        console.error('Error fetching theme:', error);
        // Fallback to light theme
        setTheme('light');
        localStorage.setItem('theme', 'light');
      } finally {
        setMounted(true);
      }
    };

    fetchUserTheme();
  }, []);

  // Handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme
    );
  }, [theme]);

  // Add script to head to prevent theme flash
  useEffect(() => {
    const scriptElement = document.createElement('script');
    scriptElement.innerHTML = themeScript;
    document.head.appendChild(scriptElement);
    return () => {
      document.head.removeChild(scriptElement);
    };
  }, []);

  if (!mounted) return null;

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
