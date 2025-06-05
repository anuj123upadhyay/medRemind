import { StyleSheet } from 'react-native';
import { lightTheme, darkTheme } from './ThemeContext';

// Type definitions for our style system
export type ThemeColors = typeof lightTheme;

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Typography styles
export const typography = {
  header: {
    fontWeight: 'bold' as const,
    fontSize: 22,
  },
  subheader: {
    fontWeight: 'bold' as const,
    fontSize: 18,
  },
  title: {
    fontWeight: 'bold' as const,
    fontSize: 16,
  },
  body: {
    fontSize: 14,
  },
  caption: {
    fontSize: 12,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  }
};

// Create a standard shadow for iOS and Android
export const shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  }
};

// Common border radius values
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  pill: 24,
  circle: 9999,
};

// Standard header height for consistent sizing
export const HEADER_HEIGHT = 120;

// Reusable common styles that can be used across components
export const createCommonStyles = (theme: ThemeColors) => StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerAll: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header styles
  headerGradient: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: 'white',
    ...typography.header,
    marginLeft: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.circle / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Content styles
  content: {
    flex: 1,
    paddingTop: HEADER_HEIGHT - 10,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.small,
  },
  sectionTitle: {
    ...typography.subheader,
    marginBottom: spacing.md,
    color: theme.text,
  },

  // Button styles
  primaryButton: {
    backgroundColor: theme.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.small,
  },
  primaryButtonText: {
    color: 'white',
    ...typography.button,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primary,
  },
  secondaryButtonText: {
    color: theme.primary,
    ...typography.button,
  },
  textButton: {
    padding: spacing.sm,
  },
  textButtonText: {
    color: theme.primary,
    ...typography.body,
    fontWeight: 'bold' as const,
  },

  // Form elements
  input: {
    backgroundColor: theme.card,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: theme.text,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 45,
  },
  label: {
    fontSize: typography.body.fontSize,
    color: theme.text,
    marginBottom: spacing.xs,
    fontWeight: '500' as const,
  },
  
  // List items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  
  // Helper text
  errorText: {
    color: theme.error,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  infoText: {
    color: theme.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
});
