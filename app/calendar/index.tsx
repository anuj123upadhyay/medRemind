import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { 
  getUserMedicines
} from "../../services/medicationService";
import { 
  getReminderHistory
} from "../../services/doseHistoryService";
import { Medicine, Reminder } from "../../services/collections";
import { account } from "../../services/appwrite";

// Import from our style system and components
import { useTheme } from "../../utils/ThemeContext";
import { 
  borderRadius, 
  createCommonStyles, 
  shadow, 
  spacing, 
  typography 
} from "../../utils/StyleSystem";
import Button from "../../components/Button";
import Header from "../../components/Header";
import CalendarMedicationCard from "../../components/CalendarMedicationCard";

// Legacy type definitions for transition period  
interface Medication {
  id: string;
  name: string;
  medicineName: string;
  dosage: string;
  times: string[];
  startDate: string; // Keep as string for compatibility
  duration: string;
  color: string;
  reminderEnabled: boolean;
  currentSupply: number;
  totalSupply: number;
  refillAt: number;
  refillReminder: boolean;
  lastRefillDate?: string;
  medicineId: string; // Add for ID mapping
}

interface DoseHistory {
  id: string;
  medicationId: string;
  timestamp: string;
  taken: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);

  const loadData = useCallback(async () => {
    try {
      // Get current user ID for reminder history
      const userId = (await account.get()).$id;
      
      // Calculate date range for reminder history
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      // Load medicines and reminder history using Appwrite services
      const [allMedicines, reminderHistory] = await Promise.all([
        getUserMedicines(),
        getReminderHistory(userId, startOfMonth, endOfMonth),
      ]);

      // Convert Medicine objects to Medication format for compatibility with existing components
      const convertedMedications: Medication[] = allMedicines.map((medicine: any) => ({
        ...medicine,
        id: medicine.$id, // Use Appwrite document ID for UI components
        name: medicine.medicineName, // Map medicineName to name for CalendarMedicationCard
        startDate: new Date(medicine.startDate).toISOString(), // Convert to string format
        duration: medicine.duration === -1 ? "Ongoing" : `${medicine.duration} days`, // Convert to string format
        color: medicine.color || "#E91E63", // Provide default color if undefined
      }));

      // Convert reminder history to DoseHistory format
      const convertedDoseHistory: DoseHistory[] = reminderHistory.map((reminder: any) => ({
        id: reminder.$id,
        medicationId: reminder.medicineId, // Use medicineId from reminder
        timestamp: reminder.scheduledTime ? new Date(reminder.scheduledTime).toISOString() : new Date().toISOString(),
        taken: reminder.status === 'taken'
      }));

      setMedications(convertedMedications);
      setDoseHistory(convertedDoseHistory);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(selectedDate);

  const renderCalendar = () => {
    const calendar: JSX.Element[] = [];
    let week: JSX.Element[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      week.push(<View key={`empty-start-${i}`} style={styles.calendarDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= days; day++) {
      const date = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        day
      );
      const isToday = new Date().toDateString() === date.toDateString();
      const hasDoses = doseHistory.some(
        (dose) =>
          new Date(dose.timestamp).toDateString() === date.toDateString()
      );

      const isSelected = date.toDateString() === selectedDate.toDateString();
      week.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.calendarDay,
            isToday && [styles.today, { backgroundColor: `${theme.primary}10` }],
            isSelected && [styles.selectedDay, { backgroundColor: theme.primary }],
            hasDoses && styles.hasEvents,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.dayText, 
            isToday && [styles.todayText, { color: theme.primary }],
            isSelected && [styles.selectedDayText, { color: 'white' }],
            !isToday && !isSelected && { color: theme.text }
          ]}>
            {day}
          </Text>
          {hasDoses && <View style={[styles.eventDot, { backgroundColor: isSelected ? 'white' : theme.primary }]} />}
        </TouchableOpacity>
      );

      // Check if we've reached the end of a week
      if ((firstDay + day) % 7 === 0) {
        calendar.push(
          <View key={`week-${Math.floor((firstDay + day) / 7)}`} style={styles.calendarWeek}>
            {[...week]}
          </View>
        );
        week = [];
      }
    }

    // Add any remaining days to the last week
    if (week.length > 0) {
      // Fill the rest of the row with empty cells if needed
      const remainingCells = 7 - week.length;
      for (let i = 0; i < remainingCells; i++) {
        week.push(<View key={`empty-end-${i}`} style={styles.calendarDay} />);
      }
      
      calendar.push(
        <View key={`week-last`} style={styles.calendarWeek}>
          {week}
        </View>
      );
    }

    return calendar;
  };

  const renderMedicationsForDate = () => {
    const dateStr = selectedDate.toDateString();
    const dayDoses = doseHistory.filter(
      (dose) => new Date(dose.timestamp).toDateString() === dateStr
    );

    // Current date for comparison (to handle medications added today)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Filter medications to only show those valid for the selected date
    // Medications should only show on dates:
    // 1. On or after their start date, AND
    // 2. Within the duration period (if not ongoing)
    const medicationsForDate = medications.filter(medication => {
      // Convert start date string to Date object
      const startDate = new Date(medication.startDate);
      // Reset time portion for proper date comparison
      startDate.setHours(0, 0, 0, 0);
      
      // Compare dates (selected date should be >= start date)
      const selDate = new Date(selectedDate);
      selDate.setHours(0, 0, 0, 0);
      
      // Calculate medicine duration end date
      const durationDays = parseInt(medication.duration.split(" ")[0]);
      const endDate = durationDays === -1 ? null : new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
      
      // Only show medication if:
      // 1. Selected date is on or after start date AND
      // 2. Selected date is before or equal to the medication end date (if duration is not ongoing)
      return selDate >= startDate && 
             (endDate === null || selDate <= endDate);
    });

    if (medicationsForDate.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons 
            name="calendar-outline" 
            size={48} 
            color={theme.textTertiary} 
          />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            No medications for this date
          </Text>
          <Button
            title="Add Medication"
            onPress={() => router.push('/medications/add')}
            icon="add-circle-outline"
            size="small"
          />
        </View>
      );
    }

    return medicationsForDate.map((medication) => {
      const taken = dayDoses.some(
        (dose) => dose.medicationId === medication.id && dose.taken
      );
      
      // Check if this is a past date and the medication was not taken
      const isMissed = selectedDate < new Date() && 
        selectedDate.toDateString() !== new Date().toDateString() && 
        !taken;
      
      // Determine if the selected date is in the future
      const isFutureDate = selectedDate > new Date();
      
      const now = new Date();
      const isToday = selectedDate.toDateString() === now.toDateString();
      
      // Check if dose can be taken (only enforce time restrictions for today's doses)
      const canTakeDose = (time: string) => {
        if (!isToday) return true; // Allow taking/editing past doses without time restriction
        
        // For today, check if the current time is past the scheduled dose time
        const [schedHours, schedMinutes] = time.split(':').map(num => parseInt(num, 10));
        const scheduledTime = new Date(
          now.getFullYear(), 
          now.getMonth(), 
          now.getDate(), 
          schedHours, 
          schedMinutes, 
          0, 
          0
        );
        
        return now >= scheduledTime;
      };
      
      // Check if medication has any available doses to take today
      const hasDueTime = isToday ? medication.times.some(time => canTakeDose(time)) : true;
      
      return (
        <CalendarMedicationCard
          key={medication.id}
          medication={medication}
          isTaken={taken}
          isMissed={isMissed}
          isDue={hasDueTime}
          date={selectedDate}
        />
      );
    });
  };

  return (
    <View style={commonStyles.container}>
      <Header 
        title="Calendar" 
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={[styles.calendarContainer, { backgroundColor: theme.card }]}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={() =>
                setSelectedDate(
                  new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() - 1,
                    1
                  )
                )
              }
              style={[styles.monthNavButton, { backgroundColor: `${theme.primary}10` }]}
            >
              <Ionicons name="chevron-back" size={24} color={theme.primary} />
            </TouchableOpacity>

            <Text style={[styles.monthTitle, { color: theme.text }]}>
              {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setSelectedDate(
                  new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1,
                    1
                  )
                )
              }
              style={[styles.monthNavButton, { backgroundColor: `${theme.primary}10` }]}
            >
              <Ionicons name="chevron-forward" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayHeader}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.weekday}>
                <Text style={[styles.weekdayText, { color: theme.textSecondary }]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {renderCalendar()}
        </View>

        <ScrollView style={styles.medicationsContainer}>
          {renderMedicationsForDate()}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
  },
  calendarContainer: {
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  monthTitle: {
    ...typography.subheader,
    fontWeight: '600',
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  weekday: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    ...typography.caption,
    fontWeight: '600',
  },
  calendarWeek: {
    flexDirection: 'row',
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  dayText: {
    ...typography.body,
  },
  today: {
    borderRadius: borderRadius.circle,
  },
  todayText: {
    fontWeight: '600',
  },
  selectedDay: {
    borderRadius: borderRadius.circle,
  },
  selectedDayText: {
    fontWeight: '600',
  },
  hasEvents: {
    position: 'relative',
  },
  eventDot: {
    position: 'absolute',
    bottom: '15%',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  medicationsContainer: {
    paddingTop: spacing.md,
  },
});