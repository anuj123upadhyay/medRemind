import React, { createContext, useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { checkSession, login, logout, registerUser } from '../services/authService';
import { User } from '../services/collections';
import { router } from 'expo-router';

// Define the shape of the auth context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  userProfile: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  userProfile: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  refreshProfile: async () => {},
});

// Export hook for easy context consumption
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { isLoggedIn, user, profile } = await checkSession();
        setIsAuthenticated(isLoggedIn);
        setUser(user);
        // Convert profile document to User type before setting
        if (profile) {
          setUserProfile({
            userID: profile.userID || profile.$id || '',
            username: profile.username || profile.name || '',
            email: profile.email || '',
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
            expoPushToken: profile.expoPushToken
          } as User);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, profile } = await login(email, password);
      setIsAuthenticated(true);
      setUser(user);
      // Convert profile document to User type before setting
      if (profile) {
        setUserProfile({
          userID: profile.userID || profile.$id || '',
          username: profile.username || profile.name || '',
          email: profile.email || '',
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
          expoPushToken: profile.expoPushToken
        } as User);
      }
      router.replace('/home');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setIsAuthenticated(false);
      setUser(null);
      setUserProfile(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { user, profile } = await registerUser(email, password, name);
      setIsAuthenticated(true);
      setUser(user);
      // Convert profile document to User type before setting
      if (profile) {
        setUserProfile({
          userID: profile.userID || profile.$id || '',
          username: profile.username || profile.name || '',
          email: profile.email || '',
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
          expoPushToken: profile.expoPushToken
        } as User);
      }
      router.replace('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile handler
  const refreshProfile = async () => {
    try {
      if (!user) return;
      
      const { profile } = await checkSession();
      if (profile) {
        setUserProfile({
          userID: profile.userID || profile.$id || '',
          username: profile.username || profile.name || '',
          email: profile.email || '',
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
          expoPushToken: profile.expoPushToken
        } as User);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    userProfile,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    refreshProfile,
  };

  // Show loading indicator during authentication check
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};