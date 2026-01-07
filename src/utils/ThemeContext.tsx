import {useColorScheme} from 'nativewind';
import React, {createContext, useContext, ReactNode, useEffect} from 'react';
import {Platform} from 'react-native';

type ThemeContextType = {
  theme: 'light' | 'dark' | undefined;
  switchTheme: (mode: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({children}: ThemeProviderProps) => {
  const {colorScheme, setColorScheme, toggleColorScheme} = useColorScheme();
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document?.documentElement?.classList?.add(
        colorScheme ? colorScheme : 'dark',
      );
    }
  }, []);
  useEffect(() => {
    // Load theme from localStorage on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setColorScheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage on change and update meta tags
    if (Platform.OS === 'web' && colorScheme) {
      localStorage.setItem('theme', colorScheme);
      document?.documentElement?.classList?.remove('light', 'dark');
      document?.documentElement?.classList?.add(colorScheme);

      // Update theme-color meta tag
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute(
          'content',
          colorScheme === 'dark' ? '#16181b' : '#F4F4F5',
        );
      }

      // Update apple-mobile-web-app-status-bar-style
      const appleStatusBarMeta = document.querySelector(
        'meta[name="apple-mobile-web-app-status-bar-style"]',
      );
      if (appleStatusBarMeta) {
        appleStatusBarMeta.setAttribute(
          'content',
          colorScheme === 'dark' ? 'black-translucent' : 'default',
        );
      }
    }
  }, [colorScheme]);
  return (
    <ThemeContext.Provider
      value={{
        theme: colorScheme,
        switchTheme: setColorScheme,
        toggleTheme: toggleColorScheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
