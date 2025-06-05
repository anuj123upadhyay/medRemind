import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Medication } from '../utils/storage';
import { useTheme } from '../utils/ThemeContext';
import { borderRadius, shadow, spacing, typography } from '../utils/StyleSystem';

interface CalendarMedicationCardProps {
  medication: Medication;
  isTaken?: boolean;
  date?: Date;
  isMissed?: boolean;
  isDue?: boolean;
}

export default function CalendarMedicationCard({
  medication,
  isTaken = false,
  date = new Date(),
  isMissed = false,
  isDue = true,
}: CalendarMedicationCardProps) {
  const { theme, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  }, []);
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const animatedStyle = {
    transform: [
      {
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
      {
        scale: scaleAnim,
      },
    ],
    opacity: slideAnim,
  };

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <LinearGradient
        colors={[
          isDark ? `${medication.color}35` : `${medication.color}25`,
          isDark ? `${medication.color}20` : `${medication.color}15`,
          theme.card
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.card,
          {
            borderLeftColor: medication.color,
            borderLeftWidth: 5,
            shadowColor: medication.color,
            shadowOpacity: isDark ? 0.5 : 0.3,
            borderColor: isDark ? `${medication.color}50` : `${medication.color}30`,
            borderWidth: 1,
            backgroundColor: theme.card,
          },
        ]}
      >
        <View style={styles.timeColumn}>
          {medication.times.map((time, index) => (
            <View key={index} style={styles.timeItem}>
              <View style={[
                styles.timeIcon, 
                { backgroundColor: isDark ? `${medication.color}25` : `${medication.color}15` }
              ]}>
                <Ionicons name="time-outline" size={16} color={medication.color} />
              </View>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                {formatTime(time)}
              </Text>
            </View>
          ))}
        </View>
        
        <View style={styles.contentColumn}>
          <View style={styles.headerRow}>
            <Text style={[styles.medicationName, { color: theme.text }]}>
              {medication.name}
            </Text>
            {isTaken ? (
              <View style={[styles.takenBadge, { 
                backgroundColor: isDark ? `${medication.color}30` : `${medication.color}15`,
                borderColor: medication.color,
              }]}>
                <Ionicons name="checkmark-circle" size={16} color={medication.color} />
                <Text style={[styles.takenText, { color: medication.color }]}>Taken</Text>
              </View>
            ) : isMissed ? (
              <View style={[styles.missedBadge, { 
                backgroundColor: isDark ? 'rgba(255, 0, 0, 0.25)' : 'rgba(255, 0, 0, 0.1)',
                borderColor: '#FF0000',
              }]}>
                <Ionicons name="alert-circle" size={16} color="#FF0000" />
                <Text style={[styles.missedText, { color: '#FF0000' }]}>Missed</Text>
              </View>
            ) : null}
          </View>
          
          <View style={styles.detailsRow}>
            <View style={[
              styles.dosageContainer, 
              { backgroundColor: isDark ? `${medication.color}25` : `${medication.color}15` }
            ]}>
              <Ionicons name="medical-outline" size={14} color={medication.color} />
              <Text style={[styles.dosageText, { color: medication.color }]}>
                {medication.dosage}
              </Text>
            </View>
            
            <View style={[
              styles.supplyContainer, 
              { backgroundColor: isDark ? `${medication.color}25` : `${medication.color}15` }
            ]}>
              <Ionicons name="flask-outline" size={14} color={medication.color} />
              <Text style={[styles.supplyText, { color: medication.color }]}>
                {medication.currentSupply} left
              </Text>
            </View>
          </View>
          
          {!isTaken && !isDue && (
            <View style={[
              styles.upcomingBanner, 
              { 
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f5f5f5',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0' 
              }
            ]}>
              <Ionicons name="time-outline" size={14} color={isDark ? theme.textSecondary : "#777"} />
              <Text style={[
                styles.upcomingText,
                { color: isDark ? theme.textSecondary : "#666" }
              ]}>
                {new Date().toDateString() === date?.toDateString() ? 'Due later today' : 'Scheduled for this date'}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: borderRadius.large,
    padding: spacing.md,
    flexDirection: 'row',
    borderLeftWidth: 5,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  timeColumn: {
    paddingRight: spacing.md,
    borderRightWidth: 1,
    borderRightColor: 'rgba(128, 128, 128, 0.15)', // Works for both light and dark mode
  },
  timeItem: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  timeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  contentColumn: {
    flex: 1,
    paddingLeft: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  medicationName: {
    fontSize: typography.subheader.fontSize,
    fontWeight: '600',
    flex: 1,
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  missedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  takenText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginLeft: 4,
  },
  missedText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dosageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
  },
  dosageText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    marginLeft: 4,
  },
  supplyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
  },
  supplyText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    marginLeft: 4,
  },
  // Removed takeDoseButton styles as the button is no longer needed in calendar view
  upcomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  upcomingText: {
    fontSize: typography.caption.fontSize,
    marginLeft: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
