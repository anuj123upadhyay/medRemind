import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import Svg, { Circle } from "react-native-svg";
import { useTheme } from '../utils/ThemeContext';
import { typography, spacing } from '../utils/StyleSystem';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number;
  totalDoses: number;
  completedDoses: number;
}

export default function CircularProgress({
  progress,
  totalDoses,
  completedDoses,
}: CircularProgressProps) {
  const { theme, isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const cappedProgress = Math.min(progress, 1);
  const size = width * 0.55;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const getProgressColor = () => {
    if (cappedProgress < 0.25) return "#FF5252";
    if (cappedProgress < 0.5) return "#FFA726";
    if (cappedProgress < 0.75) return "#FFEB3B";
    return "#66BB6A";
  };

  const progressColor = getProgressColor();

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: cappedProgress,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [cappedProgress]);

  return (
    <View
      style={styles.container}
    >
      <View style={[styles.progressRingContainer, { 
        backgroundColor: isDark ? theme.card : '#fff',
      }]}>
        <View style={styles.progressTextContainer}>
          <Text style={[
            styles.progressPercentage, 
            { color: isDark ? "white" : theme.text }
          ]}>
            {Math.round(cappedProgress * 100)}%
          </Text>
          <Text style={[
            styles.progressDetails, 
            { color: isDark ? "rgba(255, 255, 255, 0.8)" : theme.textSecondary }
          ]}>
            {completedDoses} of {totalDoses} doses
          </Text>
        </View>

        <Svg width={size} height={size} style={styles.svgContainer}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"} // Adjusted opacity
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [circumference, 0],
            })}
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md, // Added some padding for better layout
  },
  progressRingContainer: { // Renamed from progressRing3D and simplified
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2, // Make it circular
    alignItems: 'center',
    justifyContent: 'center',
    // Basic shadow for some depth, platform-agnostic
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3, // For Android
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Ensure text is above the SVG
    width: '100%',
    height: '100%',
  },
  progressPercentage: {
    fontSize: typography.header.fontSize, // Adjusted for better fit, changed from h2 to header
    fontWeight: 'bold',
    // Removed textShadow
  },
  progressDetails: {
    fontSize: typography.body.fontSize,
    marginTop: spacing.xs,
    // Removed textShadow
  },
  svgContainer: { // Renamed from progressRing
    transform: [{ rotateZ: '-90deg' }], // Changed rotate to rotateZ for clarity
  },
});
