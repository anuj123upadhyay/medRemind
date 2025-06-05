import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import { createCommonStyles, HEADER_HEIGHT, spacing, typography } from '../utils/StyleSystem';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  lightContent?: boolean;
}

export default function Header({ 
  title, 
  onBack, 
  rightComponent,
  rightElement,
  transparent = false,
  lightContent = true
}: HeaderProps) {
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);

  return (
    <View style={styles.container}>
      {!transparent && (
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          style={commonStyles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}

      <View style={styles.headerContent}>
        {onBack && (
          <TouchableOpacity 
            onPress={onBack} 
            style={[
              commonStyles.backButton,
              transparent && styles.transparentBackButton
            ]}
          >
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={lightContent ? "white" : theme.text} 
            />
          </TouchableOpacity>
        )}
        
        <Text 
          style={[
            commonStyles.headerTitle, 
            transparent && { color: theme.text }
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {(rightComponent || rightElement) && (
          <View style={styles.rightComponentContainer}>
            {rightComponent}
            {rightElement}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    height: HEADER_HEIGHT,
  },
  transparentBackButton: {
    backgroundColor: 'transparent',
  },
  rightComponentContainer: {
    marginLeft: 'auto',
  },
});
