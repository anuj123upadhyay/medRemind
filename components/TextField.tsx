// Enhanced TextField component with animations and better feedback
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  Animated,
  Easing,
  Platform,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { borderRadius, spacing, typography } from '../utils/StyleSystem';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  secure?: boolean;
  colorVariant?: 'primary' | 'secondary' | 'dark';
}

export default function TextField({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secure = false,
  value,
  colorVariant = 'primary',
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const { theme } = useTheme();
  
  // States
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(secure);
  const [hasContent, setHasContent] = useState(!!value);
  
  // Animation values
  const labelPositionAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  
  // Update floating label animation when value changes externally
  useEffect(() => {
    setHasContent(!!value);
    if (!!value !== !!hasContent) {
      animateLabel(!!value);
    }
  }, [value]);

  // Animate the floating label
  const animateLabel = (toValue: boolean) => {
    Animated.timing(labelPositionAnim, {
      toValue: toValue ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  // Animate the focus indicator
  const animateFocus = (focused: boolean) => {
    Animated.timing(focusAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  // Handle focus
  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    animateLabel(true);
    animateFocus(true);
    onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (!hasContent) {
      animateLabel(false);
    }
    animateFocus(false);
    onBlur?.(e);
  };

  // Handle text change
  const handleChangeText = (text: string) => {
    setHasContent(text.length > 0);
    rest.onChangeText?.(text);
  };

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setIsSecureTextEntry(!isSecureTextEntry);
  };

  // Handle container press (focus the input)
  const handleContainerPress = () => {
    inputRef.current?.focus();
  };
  
  // Determine if the password toggle should be shown
  const shouldShowPasswordToggle = secure && !rightIcon;

  // Get color variants
  const getColorVariant = () => {
    switch (colorVariant) {
      case 'primary':
        return {
          focusColor: theme.primary,
          iconColor: theme.primary,
        };
      case 'secondary':
        return {
          focusColor: theme.secondary,
          iconColor: theme.secondary,
        };
      case 'dark':
        return {
          focusColor: theme.text,
          iconColor: theme.textSecondary,
        };
      default:
        return {
          focusColor: theme.primary,
          iconColor: theme.primary,
        };
    }
  };

  const colors = getColorVariant();

  // Interpolate label position and size
  const labelTop = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [spacing.sm + 14, 0], // Move from center to top
  });

  const labelFontSize = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12], // Shrink text
  });

  // Interpolate underline width for focus effect
  const underlineWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <TouchableOpacity 
      activeOpacity={1}
      onPress={handleContainerPress}
      style={[styles.container, containerStyle]}
    >
      {/* Label */}
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: error ? theme.error : (isFocused ? colors.focusColor : theme.textSecondary),
              backgroundColor: isFocused || hasContent ? theme.card : 'transparent',
              paddingHorizontal: isFocused || hasContent ? 8 : 0,
              zIndex: 1,
            },
          ]}
        >
          {label}
        </Animated.Text>
      )}
      
      {/* Input container */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.error : (isFocused ? colors.focusColor : theme.border),
            backgroundColor: theme.card,
          },
        ]}
      >
        {/* Left icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? theme.error : (isFocused ? colors.iconColor : theme.textSecondary)}
            style={styles.leftIcon}
          />
        )}

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { 
              color: error ? theme.error : theme.text,
              paddingLeft: leftIcon ? 0 : spacing.md,
            },
          ]}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={isSecureTextEntry}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          underlineColorAndroid="transparent"
          selectionColor={colors.focusColor}
          {...rest}
        />
        
        {/* Right icon or secure toggle */}
        {(rightIcon || shouldShowPasswordToggle) && (
          <TouchableOpacity
            onPress={shouldShowPasswordToggle ? toggleSecureEntry : onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={shouldShowPasswordToggle ? (isSecureTextEntry ? 'eye-outline' : 'eye-off-outline') : rightIcon!}
              size={20}
              color={error ? theme.error : (isFocused ? colors.iconColor : theme.textSecondary)}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Animated focus underline */}
      <Animated.View
        style={[
          styles.focusLine,
          {
            backgroundColor: error ? theme.error : colors.focusColor,
            width: underlineWidth,
          },
        ]}
      />

      {/* Error or helper text */}
      {(error || helper) && (
        <Text
          style={[
            styles.helperText,
            { color: error ? theme.error : theme.textSecondary },
          ]}
        >
          {error || helper}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    position: 'absolute',
    left: spacing.sm,
    fontWeight: '500',
    ...Platform.select({
      ios: {
        top: -8,
      },
      android: {
        top: -7,
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    minHeight: 56,
    paddingRight: spacing.md,
  },
  input: {
    flex: 1,
    height: 56,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? undefined : 'sans-serif',
  },
  leftIcon: {
    marginHorizontal: spacing.md,
  },
  rightIcon: {
    padding: spacing.xs,
  },
  helperText: {
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    fontSize: 12,
  },
  focusLine: {
    height: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
    marginTop: -2,
    alignSelf: 'center',
    borderRadius: 1,
    marginBottom: 0, // Handle error margin inline instead
  },
});
