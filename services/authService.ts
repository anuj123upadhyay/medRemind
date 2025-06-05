// Authentication service for Appwrite
import { ID } from 'react-native-appwrite';
import { account, databases, Query } from './appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS, User } from './collections';

// Helper function to find user profile by userID
const findUserProfile = async (userID: string) => {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('userID', userID)]
    );
    
    if (response.documents.length > 0) {
      return response.documents[0];
    }
    throw new Error('User profile not found');
  } catch (error) {
    console.error('Error finding user profile:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    console.log('Starting user registration...');
    
    // Create the user account
    const newUser = await account.create(
      ID.unique(),
      email,
      password,
      name
    );
    
    console.log('User account created:', newUser.$id);
    
    // Create user profile document with proper document ID
    const userProfile = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      ID.unique(), // Generate new document ID
      {
        userID: newUser.$id,
        username: name,
        email: email
      }
    );
    
    console.log('User profile created:', userProfile.$id);
    
    // Log in the user after registration
    return await login(email, password);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Log in a user
export const login = async (email: string, password: string) => {
  try {
    console.log('Starting user login...');
    
    // Create an email session
    const session = await account.createEmailPasswordSession(email, password);
    console.log('Session created successfully');
    
    // Get the user account
    const user = await account.get();
    console.log('User account retrieved:', user.$id);
    
    // Get user profile from database
    let userProfile;
    try {
      userProfile = await findUserProfile(user.$id);
      console.log('User profile found:', userProfile.$id);
    } catch (error) {
      console.log('User profile not found, creating new one...');
      // If profile doesn't exist yet, create one
      userProfile = await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          userID: user.$id,
          username: user.name || 'User',
          email: user.email
        }
      );
      console.log('New user profile created:', userProfile.$id);
    }
    
    return {
      session,
      user,
      profile: userProfile
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Log out current user
export const logout = async () => {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Check if user is logged in
export const checkSession = async () => {
  try {
    const user = await account.get();
    const session = await account.getSession('current');
    
    // Get user profile
    let userProfile;
    try {
      userProfile = await findUserProfile(user.$id);
    } catch (error) {
      console.log('User profile not found');
    }
    
    return {
      isLoggedIn: true,
      user,
      session,
      profile: userProfile
    };
  } catch (error) {
    console.log('Not logged in');
    return {
      isLoggedIn: false,
      user: null,
      session: null,
      profile: null
    };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await account.createRecovery(email, 'https://yourapp.com/reset-password');
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userID: string, data: Partial<User>) => {
  try {
    const profile = await findUserProfile(userID);
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      profile.$id,
      data
    );
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};