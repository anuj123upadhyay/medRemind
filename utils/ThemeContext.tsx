import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
export const lightTheme = {
  // Primary branding colors
  primary: '#e66578',       // Primary brand color
  secondary: '#fa3c78',     // Secondary brand color
  tertiary: '#f79d6f',      // Tertiary brand color (from the splash screen)
  
  // Background and surface colors
  background: '#FFFFFF',    // Main background
  card: '#F8F8F8',          // Card/Surface background
  inputBg: '#F0F0F0',       // Input field background
  
  // Text colors
  text: '#212121',          // Primary text
  textSecondary: '#757575', // Secondary text
  textTertiary: '#9E9E9E',  // Tertiary text
  
  // Utility colors
  border: '#E0E0E0',        // Border color
  divider: '#EEEEEE',       // Divider color

  // Status colors
  success: '#4CAF50',       // Success state
  warning: '#FFC107',       // Warning state
  error: '#F44336',         // Error state
  info: '#2196F3',          // Information state
  
  // Gradients
  gradientStart: '#e66578',
  gradientEnd: '#fa3c78',
};

export const darkTheme = {
  // Primary branding colors
  primary: '#FF6B8B',       // Primary brand color - warmer, more vibrant pink
  secondary: '#F95D85',     // Secondary brand color - coordinated pink
  tertiary: '#FFA78C',      // Tertiary brand color - warmer orange for better dark mode contrast
  
  // Background and surface colors
  background: '#1A1B1E',    // Main background - elegant dark slate
  card: '#24262D',          // Card/Surface background - slightly lighter slate
  inputBg: '#2C2F38',       // Input field background - elevated slate
  
  // Text colors
  text: '#F8F9FA',          // Primary text - soft white for better readability
  textSecondary: '#CED4DA', // Secondary text - softer gray
  textTertiary: '#909AA3',  // Tertiary text - muted but still readable
  
  // Utility colors
  border: '#32363F',        // Border color - subtle separation
  divider: '#2A2D36',       // Divider color - subtle but visible

  // Status colors
  success: '#4ADE80',       // Success state - vibrant green
  warning: '#FFB84C',       // Warning state - warm amber
  error: '#FF5757',         // Error state - vivid red
  info: '#5BC0EB',          // Information state - bright blue
  
  // Gradients
  gradientStart: '#ef4f67',
  gradientEnd: '#e82b68',
};

type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceColorScheme === 'dark');
  const [theme, setTheme] = useState<Theme>(isDark ? darkTheme : lightTheme);

  useEffect(() => {
    setTheme(isDark ? darkTheme : lightTheme);
  }, [isDark]);

  // Also listen for system changes
  useEffect(() => {
    setIsDark(deviceColorScheme === 'dark');
  }, [deviceColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
