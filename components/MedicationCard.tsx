// Enhanced MedicationCard with modern design and animations
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  Image,
  Easing,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import { Medicine } from '../services/collections';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../utils/ThemeContext';
import { borderRadius, shadow, spacing, typography } from '../utils/StyleSystem';

// Icon mapping for medication types
const MEDICATION_ICONS: Record<string, any> = {
  pill: require('../assets/images/pill-icon.png'),
  capsule: require('../assets/images/capsule-icon.png'),
  liquid: require('../assets/images/liquid-icon.png'),
  injection: require('../assets/images/injection-icon.png'),
  inhaler: require('../assets/images/inhaler-icon.png'),
  default: require('../assets/images/pill-icon.png'),
};

// Get gradient colors based on medication color
const getGradientColors = (color: string = '#4a80f0') => {
  const gradientMap: Record<string, string[]> = {
    '#4a80f0': ['#4a80f0', '#2e59b5'], // Blue
    '#f0784a': ['#f0784a', '#ca5e39'], // Orange
    '#4af0b0': ['#4af0b0', '#2fb088'], // Green
    '#f04a80': ['#f04a80', '#b52e59'], // Pink
    '#f0d14a': ['#f0d14a', '#c9ad3a'], // Yellow
    '#844af0': ['#844af0', '#6132c8'], // Purple
  };
  
  // Get colors as an array and convert to required type for LinearGradient
  const colors = gradientMap[color] || gradientMap['#4a80f0'];
  return colors as unknown as readonly [string, string];
};

interface MedicationCardProps {
  medication: Medicine;
  onPress?: () => void;
  onTakeDose?: () => void;
  onDelete?: () => void;
  onRefill?: () => void;
  isTaken?: boolean;
  style?: ViewStyle;
  showActions?: boolean;
  nextDoseTime?: string;
}

export default function MedicationCard({
  medication,
  onPress,
  onTakeDose,
  onDelete,
  onRefill,
  isTaken = false,
  style,
  showActions = true,
  nextDoseTime,
}: MedicationCardProps) {
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const swipeableRef = useRef<Swipeable>(null);
  
  // Pulse animation for dose due soon
  useEffect(() => {
    if (!isTaken && nextDoseTime && isTimeSoon(nextDoseTime)) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [nextDoseTime, isTaken]);
  
  // Scale animation for press feedback
  const animatePress = (pressed: boolean) => {
    setIsPressed(pressed);
    Animated.spring(scaleAnim, {
      toValue: pressed ? 0.97 : 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  // Check if time is within 30 minutes
  const isTimeSoon = (time: string) => {
    if (!time) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const diffMs = targetTime.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes > 0 && diffMinutes <= 30; // Due within 30 minutes
  };
  
  // Format next dose label
  const getNextDoseLabel = () => {
    if (!nextDoseTime) return '';
    
    const [hours, minutes] = nextDoseTime.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    
    // If time has passed today
    if (targetTime < now) {
      targetTime.setDate(targetTime.getDate() + 1); // Set to tomorrow
    }
    
    const diffMs = targetTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `in ${diffMinutes} min`;
    } else {
      const hrs = Math.floor(diffMinutes / 60);
      return `in ${hrs} ${hrs === 1 ? 'hour' : 'hours'}`;
    }
  };
  
  // Handle take dose press
  const handleTakeDose = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onTakeDose?.();
    swipeableRef.current?.close();
  };
  
  // Get supply status 
  const getSupplyStatus = () => {
    if (!medication.currentSupply || !medication.refillAt) return null;
    
    if (medication.currentSupply <= medication.refillAt) {
      return { 
        text: 'Low supply',
        color: theme.warning,
      };
    }
    
    return {
      text: `${medication.currentSupply} left`,
      color: theme.success,
    };
  };
  
  // Get icon for medication
  const getMedicationIcon = () => {
    // Using icon field or defaulting to pill
    const iconType = medication.icon || 'default';
    return MEDICATION_ICONS[iconType] || MEDICATION_ICONS.default;
  };
  
  // Pill pulse animation
  const pillScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  
  const pillOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.6, 1],
  });
  
  // Render right swipe actions
  const renderRightActions = (progress: any, dragX: any) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
    });
    
    return (
      <View style={styles.rightActions}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              onDelete?.();
            }}
          >
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  // Render left swipe actions
  const renderLeftActions = (progress: any, dragX: any) => {
    const trans = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
    });
    
    return (
      <View style={styles.leftActions}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.success }]}
            onPress={handleTakeDose}
          >
            <Ionicons name="checkmark" size={24} color="white" />
            <Text style={styles.actionText}>Take</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  // Supply status information
  const supplyStatus = getSupplyStatus();
  
  // Format time display
  const formatTime = (times: string[] = []) => {
    if (!times || !times.length) return '—';
    
    return times.join(', ');
  };
  
  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={showActions ? renderRightActions : undefined}
      renderLeftActions={showActions && !isTaken ? renderLeftActions : undefined}
      overshootRight={false}
      overshootLeft={false}
    >
      <Pressable
        onPressIn={() => animatePress(true)}
        onPressOut={() => animatePress(false)}
        onPress={onPress}
      >
        <Animated.View 
          style={[
            styles.container,
            { 
              transform: [{ scale: scaleAnim }],
              backgroundColor: theme.card,
            },
            style,
          ]}
        >
          <LinearGradient
            colors={getGradientColors(medication.color)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.colorBar}
          />
          
          <View style={styles.contentContainer}>
            {/* Medication icon and name */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Animated.Image
                  source={getMedicationIcon()}
                  style={[
                    styles.icon,
                    !isTaken && nextDoseTime && isTimeSoon(nextDoseTime) ? {
                      transform: [{ scale: pillScale }],
                      opacity: pillOpacity,
                    } : undefined
                  ]}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.titleContainer}>
                <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
                  {medication.medicineName}
                </Text>
                <Text style={[styles.dosageText, { color: theme.textSecondary }]}>
                  {medication.dosage}
                </Text>
              </View>
              
              {isTaken ? (
                <View style={[styles.statusBadge, { backgroundColor: theme.success }]}>
                  <Ionicons name="checkmark" size={12} color="white" />
                  <Text style={styles.statusBadgeText}>Taken</Text>
                </View>
              ) : nextDoseTime ? (
                <View style={styles.nextDoseContainer}>
                  <Ionicons 
                    name="time" 
                    size={14} 
                    color={isTimeSoon(nextDoseTime) ? theme.warning : theme.textSecondary}
                  />
                  <Text 
                    style={[
                      styles.nextDoseText, 
                      { 
                        color: isTimeSoon(nextDoseTime) ? theme.warning : theme.textSecondary 
                      }
                    ]}
                  >
                    {getNextDoseLabel()}
                  </Text>
                </View>
              ) : null}
            </View>
            
            {/* Medication details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                  {formatTime(medication.times)}
                </Text>
              </View>
              
              {supplyStatus && (
                <View style={styles.detailRow}>
                  <Ionicons 
                    name="medical-outline" 
                    size={14} 
                    color={supplyStatus.color}
                  />
                  <Text style={[styles.detailText, { color: supplyStatus.color }]}>
                    {supplyStatus.text}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Card actions */}
            {showActions && !isTaken && (
              <View style={styles.actionsContainer}>
                {/* Take button */}
                <TouchableOpacity 
                  style={[styles.takeButton, { backgroundColor: theme.primary }]}
                  onPress={handleTakeDose}
                >
                  <Text style={styles.takeButtonText}>Take Now</Text>
                </TouchableOpacity>
                
                {/* Refill button (conditionally shown) */}
                {supplyStatus && medication.currentSupply && medication.refillAt && 
                 medication.currentSupply <= medication.refillAt && (
                  <TouchableOpacity
                    style={[styles.refillButton, { borderColor: theme.warning }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onRefill?.();
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={theme.warning} />
                    <Text style={[styles.refillButtonText, { color: theme.warning }]}>
                      Refill
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    ...shadow.small,
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: borderRadius.medium,
    borderBottomLeftRadius: borderRadius.medium,
  },
  contentContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  icon: {
    width: 30,
    height: 30,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    ...typography.title,
    marginBottom: 2,
  },
  dosageText: {
    ...typography.caption,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
  },
  statusBadgeText: {
    ...typography.caption,
    color: 'white',
    marginLeft: 2,
    fontSize: 10,
  },
  nextDoseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  nextDoseText: {
    ...typography.caption,
    marginLeft: 4,
  },
  detailsContainer: {
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs / 2,
  },
  detailText: {
    ...typography.caption,
    marginLeft: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  takeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  takeButtonText: {
    color: 'white',
    ...typography.caption,
    fontWeight: 'bold',
  },
  refillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.small,
    borderWidth: 1,
  },
  refillButtonText: {
    ...typography.caption,
    marginLeft: 4,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leftActions: {
    flexDirection: 'row',
    width: 80,
    height: '100%',
    alignItems: 'center',
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
});