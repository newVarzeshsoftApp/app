import {colorScheme, useColorScheme} from 'nativewind';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {Appearance, Platform} from 'react-native';

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
      document.documentElement.classList.add(
        colorScheme ? colorScheme : 'dark',
      );
    }
  }, []);
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
