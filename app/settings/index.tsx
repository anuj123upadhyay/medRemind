import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Application from "expo-application";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../utils/ThemeContext";
import { useAuth } from "../../components/AuthProvider";
import { updateUserProfile } from "../../services/authService";
import Header from "../../components/Header";
import Button from "../../components/Button";
import { createCommonStyles, spacing, typography, borderRadius, shadow } from "../../utils/StyleSystem";

const SETTINGS_KEY = "@user_settings";

interface UserSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultDosageUnit: string;
  defaultNotificationTime: number; // minutes before
}

interface ProfileEditData {
  username: string;
  phone: string;
}

const defaultSettings: UserSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  defaultDosageUnit: "mg",
  defaultNotificationTime: 15,
};

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, userProfile, logout, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [appVersion, setAppVersion] = useState<string>("1.0.0");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileEditData>({
    username: userProfile?.username || '',
    phone: userProfile?.phone || '',
  });

  useEffect(() => {
    loadSettings();
    getAppVersion();
    if (userProfile?.userID) {
      loadProfileImage();
    }
  }, [userProfile?.userID]);

  useEffect(() => {
    if (userProfile) {
      setEditingProfile({
        username: userProfile.username || '',
        phone: userProfile.phone || '',
      });
    }
  }, [userProfile]);

  const getAppVersion = async () => {
    const version = await Application.nativeApplicationVersion;
    if (version) {
      setAppVersion(version);
    }
  };

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem(`@profile_image_${userProfile?.userID}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  const saveProfileImage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem(`@profile_image_${userProfile?.userID}`, imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error("Error saving profile image:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Permissions Required",
            "Please enable notifications in your device settings to receive medication reminders.",
            [
              { text: "Cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }
    }

    const newSettings = { ...settings, notificationsEnabled: value };
    saveSettings(newSettings);
  };

  const handleExportData = async () => {
    // This would be implemented to export user data
    Alert.alert(
      "Export Data",
      "This feature will allow you to export your medication data as a CSV file.",
      [{ text: "OK" }]
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await saveProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      
      if (!userProfile?.userID) {
        Alert.alert('Error', 'User profile not found. Please try logging in again.');
        return;
      }

      // Validate input
      if (!editingProfile.username.trim()) {
        Alert.alert('Error', 'Username cannot be empty.');
        return;
      }

      // Update profile in Appwrite
      await updateUserProfile(userProfile.userID, {
        username: editingProfile.username.trim(),
        phone: editingProfile.phone.trim() || undefined
      });

      // Show success message
      Alert.alert('Success', 'Profile updated successfully!');
      setShowEditProfile(false);
      
      // Refresh the user profile to show updated data
      await refreshProfile();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const resetEditingProfile = () => {
    setEditingProfile({
      username: userProfile?.username || '',
      phone: userProfile?.phone || '',
    });
  };

  const handleEditProfile = () => {
    resetEditingProfile();
    setShowEditProfile(true);
  };

  const handleCancelEdit = () => {
    resetEditingProfile();
    setShowEditProfile(false);
  };

  const commonStyles = createCommonStyles(theme);
  
  const styles = StyleSheet.create({
    profileSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      marginBottom: spacing.lg,
    },
    profileCard: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      alignItems: 'center',
      width: '100%',
      ...shadow.small,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: spacing.md,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: theme.primary,
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.card,
    },
    profileName: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.xs,
    },
    profileEmail: {
      fontSize: typography.body.fontSize,
      color: theme.textSecondary,
      marginBottom: spacing.md,
    },
    profileActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    editButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.medium,
      minWidth: 80,
    },
    editButtonText: {
      color: 'white',
      fontSize: typography.caption.fontSize,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    logoutButton: {
      backgroundColor: '#FF6B6B',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.medium,
      minWidth: 80,
    },
    logoutButtonText: {
      color: 'white',
      fontSize: typography.caption.fontSize,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.large,
      padding: spacing.xl,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    inputLabel: {
      fontSize: typography.body.fontSize,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.xs,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.medium,
      padding: spacing.md,
      fontSize: typography.body.fontSize,
      color: theme.text,
      backgroundColor: theme.background,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.medium,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.border,
    },
    saveButton: {
      backgroundColor: theme.primary,
    },
    modalButtonText: {
      fontSize: typography.body.fontSize,
      fontWeight: 'bold',
    },
    cancelButtonText: {
      color: theme.text,
    },
    saveButtonText: {
      color: 'white',
    },
    section: {
      marginBottom: spacing.xl,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    settingLabel: {
      fontSize: typography.body.fontSize,
      fontWeight: 'bold',
      color: theme.text,
    },
    settingDescription: {
      fontSize: typography.caption.fontSize,
      color: theme.textSecondary,
      marginTop: spacing.xs,
    },
    linkButton: {
      paddingVertical: spacing.md,
      alignItems: 'flex-start',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    versionText: {
      textAlign: 'center',
      marginVertical: spacing.xl,
      fontSize: typography.caption.fontSize,
      color: theme.textSecondary,
    },
  });

  return (
    <View style={commonStyles.container}>
      <Header title="Settings" onBack={() => router.back()} />

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials(userProfile?.username || user?.name || 'User')}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.profileName}>
              {userProfile?.username || user?.name || 'User'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'No email'}
            </Text>
            
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleEditProfile}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditProfile}
          transparent={true}
          animationType="fade"
          onRequestClose={() => !isUpdatingProfile && handleCancelEdit()}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => !isUpdatingProfile && handleCancelEdit()}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={() => {}} // Prevent event bubbling
            >
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingProfile.username}
                  onChangeText={(text) => setEditingProfile({...editingProfile, username: text})}
                  placeholder="Enter username"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingProfile.phone}
                  onChangeText={(text) => setEditingProfile({...editingProfile, phone: text})}
                  placeholder="Enter phone number"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => !isUpdatingProfile && handleCancelEdit()}
                  disabled={isUpdatingProfile}
                >
                  <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton, isUpdatingProfile && { opacity: 0.7 }]}
                  onPress={handleSaveProfile}
                  disabled={isUpdatingProfile}
                >
                  <Text style={[styles.modalButtonText, styles.saveButtonText]}>
                    {isUpdatingProfile ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={commonStyles.sectionTitle}>General</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Enable dark theme</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders for medications
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Sound</Text>
              <Text style={styles.settingDescription}>
                Play sound with notifications
              </Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) =>
                saveSettings({ ...settings, soundEnabled: value })
              }
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>
                Vibrate with notifications
              </Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) =>
                saveSettings({ ...settings, vibrationEnabled: value })
              }
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.sectionTitle}>Help & Support</Text>

          <Button 
            title="User Guide" 
            variant="text" 
            onPress={() => router.push('/settings/user-guide')} 
            style={styles.linkButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.sectionTitle}>Data & Privacy</Text>

          <Button 
            title="Export Medication Data" 
            variant="text" 
            onPress={handleExportData} 
            style={styles.linkButton}
          />
          
          <Button 
            title="Privacy Policy" 
            variant="text" 
            onPress={() => router.push('/settings/privacy-policy')} 
            style={styles.linkButton}
          />

          <Button 
            title="Terms of Service" 
            variant="text" 
            onPress={() => router.push('/settings/terms-of-service')}
            style={styles.linkButton}
          />
        </View>

        <Text style={styles.versionText}>MedRemind v{appVersion}</Text>
      </ScrollView>
    </View>
  );
}
