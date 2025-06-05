import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  Alert,
  AppState,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getUserMedicines,
  updateMedicine,
  deleteMedicine
} from "../services/medicationService";
import { 
  getReminderHistory, 
  recordDoseTaken,
  getAdherenceStats,
  findReminderForMedicineAndTime,
  cleanupOldReminders
} from "../services/doseHistoryService";
import { Medicine, Reminder } from "../services/collections";
import { account } from "../services/appwrite";

// Legacy type definitions for transition period
interface Medication extends Medicine {
  id: string; // For backward compatibility
}

interface DoseHistory {
  id: string;
  medicationId: string;
  timestamp: string;
  taken: boolean;
}
import { useFocusEffect } from "@react-navigation/native";
import { 
  registerForPushNotificationsAsync, 
  scheduleMedicineReminders,
  syncNotificationsWithAppwrite
} from "../utils/notifications";
// import { migrateToAppwrite, isMigrationCompleted } from "../utils/dataMigration";

// Import from our style system and components
import { useTheme } from "../utils/ThemeContext";
import { 
  borderRadius, 
  createCommonStyles, 
  shadow, 
  spacing, 
  typography 
} from "../utils/StyleSystem";
import { useAuth } from "../components/AuthProvider";
import Button from "../components/Button";
import Header from "../components/Header";
import MedicationCard from "../components/MedicationCard";
import CircularProgress from "../components/CircularProgress";

const { width } = Dimensions.get("window");

const QUICK_ACTIONS = [
  {
    icon: "add-circle-outline" as const,
    label: "Add\nMedication",
    route: "/medications/add" as const,
    gradient: ["#e66578", "#fa3c78"] as [string, string],
  },
  {
    icon: "calendar-outline" as const,
    label: "Calendar\nView",
    route: "/calendar" as const,
    gradient: ["#65b5f7", "#4a90e2"] as [string, string],
  },
  {
    icon: "stats-chart-outline" as const,
    label: "Stats &\nAdherence",
    route: "/stats" as const,
    gradient: ["#87f765", "#66bb6a"] as [string, string],
  },
  {
    icon: "medical-outline" as const,
    label: "Refill\nTracker",
    route: "/refills" as const,
    gradient: ["#FF5722", "#E64A19"] as [string, string],
  },
  // {
  //   icon: "alert-circle-outline" as const,
  //   label: "Interaction\nChecker",
  //   route: "/interactions" as const,
  //   gradient: ["#9C27B0", "#7B1FA2"] as [string, string],
  // },
  {
    icon: "settings-outline" as const,
    label: "App\nSettings",
    route: "/settings" as const,
    gradient: ["#00BCD4", "#0097A7"] as [string, string],
  },
];

// Helper function to darken/lighten colors 
const shadeColor = (color: string, percent: number): string | null => {
  if (!color) return null;
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
};

// MedicationCardComponent to prevent conditional hook calls
function MedicationCardComponent({ 
  medication, 
  isDoseTaken, 
  handleTakeDose 
}: { 
  medication: Medication; 
  isDoseTaken: (id: string, time?: string) => boolean; 
  handleTakeDose: (medication: Medication, time?: string) => Promise<void>; 
}) {
  const { theme } = useTheme();
  
  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes.padStart(2, '0')} ${period}`;
  };
  
  // Check if all doses for this medication are taken
  const allDosesTaken = medication.times.every(time => isDoseTaken(medication.id, time));
  
  return (
    <View 
      style={[
        styles.elegantMedicationCard, 
        { 
          backgroundColor: theme.card,
          borderColor: theme.border + "40",
          borderLeftColor: medication.color,
          borderLeftWidth: 3,
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.92}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <View style={styles.medicationCardContent}>
          <View style={[styles.medicationColorBar, { backgroundColor: medication.color }]} />
          <View style={styles.medicationCardHeader}>
            <View>
              <Text style={[styles.medicationName, { color: theme.text }]}>{medication.medicineName}</Text>
              <Text style={[styles.medicationDosage, { color: theme.textSecondary }]}>{medication.dosage}</Text>
            </View>
            {allDosesTaken && (
              <View style={[styles.takenBadge, { 
                backgroundColor: `${medication.color}10`,
                borderColor: medication.color,
                shadowColor: medication.color,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
                elevation: 1
              }]}>
                <Ionicons name="checkmark-circle" size={18} color={medication.color} />
                <Text style={[styles.takenText, { color: medication.color }]}>All Taken</Text>
              </View>
            )}
          </View>
          
          <View style={[
            styles.medicationCardDetails, 
            { borderTopColor: theme.border + "30" }
          ]}>
            {medication.times.map((time, index) => (
              <View key={`${medication.id}-time-${index}`} style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingVertical: 4, 
                marginBottom: 8 
              }}>
                <View style={styles.medicationTimeContainer}>
                  <View style={[styles.timeIcon, { backgroundColor: `${medication.color}15` }]}>
                    <Ionicons name="time-outline" size={16} color={medication.color} />
                  </View>
                  <Text style={[styles.medicationTime, { color: theme.textSecondary }]}>
                    {formatTime(time)}
                  </Text>
                </View>
                
                {isDoseTaken(medication.id, time) ? (
                  <View style={[styles.takenBadge, { 
                    backgroundColor: `${medication.color}10`,
                    borderColor: medication.color,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }]}>
                    <Ionicons name="checkmark-circle" size={16} color={medication.color} />
                    <Text style={[styles.takenText, { color: medication.color, fontSize: 12 }]}>Taken</Text>
                  </View>
                ) : (
                  (() => {
                    // Check if the dose time has passed
                    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
                    const doseTime = new Date();
                    doseTime.setHours(hours, minutes, 0, 0);
                    const isDue = new Date() >= doseTime;
                    
                    return (
                      <TouchableOpacity 
                        style={[
                          styles.takeDoseButton, 
                          { 
                            backgroundColor: isDue ? medication.color : theme.textTertiary,
                            borderWidth: 0,
                            paddingVertical: 4,
                            paddingHorizontal: 10,
                            opacity: isDue ? 1 : 0.7,
                          }
                        ]}
                        onPress={() => {
                          if (isDue) {
                            handleTakeDose(medication, time);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          } else {
                            Alert.alert(
                              "Not Due Yet",
                              `This dose is scheduled for ${formatTime(time)}. You can't mark it as taken before the scheduled time.`
                            );
                          }
                        }}
                      >
                        <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                        <Text style={styles.takeDoseText}>Take</Text>
                      </TouchableOpacity>
                    );
                  })()
                )}
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// NotificationItemComponent to prevent conditional hook calls
function NotificationItemComponent({ medication }: { medication: Medication }) {
  const { theme } = useTheme();
  
  return (
    
    <View style={[styles.notificationItem, { backgroundColor: `${theme.inputBg}` }]}>
      <View style={[
        styles.notificationIcon,
        { backgroundColor: `${medication.color}20` }
      ]}>
        <Ionicons name="medical" size={24} color={medication.color} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: theme.text }]}>
          {medication.medicineName}
        </Text>
        <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
          {medication.dosage}
        </Text>
        <Text style={[styles.notificationTime, { color: theme.textTertiary }]}>
          {medication.times[0]}
        </Text>
      </View>
    </View>
    
  );
}

export default function HomeScreen() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todaysMedications, setTodaysMedications] = useState<Medication[]>([]);
  const [completedDoses, setCompletedDoses] = useState(0);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);

  const loadMedications = useCallback(async () => {
    try {
      const userId = (await account.get()).$id;
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Clean up old reminders periodically (once per day)
      const lastCleanup = await AsyncStorage.getItem('lastReminderCleanup');
      const todayString = today.toDateString();
      if (lastCleanup !== todayString) {
        try {
          await cleanupOldReminders(userId);
          await AsyncStorage.setItem('lastReminderCleanup', todayString);
        } catch (error) {
          console.log('Cleanup failed, will retry next time:', error);
        }
      }
      
      const [allMedicationsDoc, todaysDosesDoc] = await Promise.all([
        getUserMedicines(),
        getReminderHistory(userId, startOfDay, endOfDay),
      ]);

      // Convert documents to proper types
      const allMedications = allMedicationsDoc.map(doc => ({
        ...doc as unknown as Medicine,
        id: doc.$id
      })) as Medication[];
      
      const todaysDoses = todaysDosesDoc.map(doc => ({
        id: doc.$id,
        medicationId: (doc as any).medicineId || '',
        timestamp: (doc as any).scheduledTime || new Date().toISOString(),
        taken: (doc as any).status === 'taken'
      })) as DoseHistory[];

      setDoseHistory(todaysDoses);
      setMedications(allMedications);

      // Filter medications for today
      
      // Make sure only medications with start date today or earlier are shown (not future start dates)
      const todayMeds = allMedications.filter((med: Medication) => {
        const startDate = new Date(med.startDate);
        // Reset time for proper date comparison
        startDate.setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        const durationDays = med.duration ? parseInt(String(med.duration).split(" ")[0]) : -1;

        // For ongoing medications or if within duration
        // AND if the start date is today or earlier
        if (
          (durationDays === -1 ||
            (todayDate >= startDate &&
              todayDate <=
                new Date(
                  startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
                ))
          ) && todayDate >= startDate
        ) {
          return true;
        }
        return false;
      });

      setTodaysMedications(todayMeds);

      // Calculate total possible doses for today, but only count those that are due
      let totalPossibleDoses = 0;
      const currentTime = new Date().getTime();
      
      // Count only doses that are already due (scheduled time has passed)
      for (const med of todayMeds) {
        for (const time of med.times) {
          const [hours, minutes] = time.split(':').map((num: string) => parseInt(num, 10));
          const doseTime = new Date().setHours(hours, minutes, 0, 0);
          
          if (currentTime >= doseTime) {
            totalPossibleDoses++;
          }
        }
      }
      
      // Calculate completed doses by checking if each medication's time has been taken
      let completed = 0;
      for (const med of todayMeds) {
        for (const time of med.times) {
          // Check if this specific dose has been taken
          const [hours, minutes] = time.split(':').map((num: string) => parseInt(num, 10));
          const doseTime = new Date().setHours(hours, minutes, 0, 0);
          
          // Check if current time is past the scheduled dose time
          const currentTime = new Date().getTime();
          // Only count doses that are due (current time >= scheduled time)
          const isDue = currentTime >= doseTime;
          
          const isDoseTaken = todaysDoses.some((dose: DoseHistory) => {
            if (dose.medicationId === med.medicineId && dose.taken) {
              const doseTimestamp = new Date(dose.timestamp).getTime();
              // Dose is considered taken if recorded at or after the scheduled time
              return doseTimestamp >= doseTime;
            }
            return false;
          });
          
          // Only count doses that are due
          if (isDue) {
            // If the dose is due, check if it's taken
            if (isDoseTaken) {
              completed++;
            }
          }
        }
      }
      
      setCompletedDoses(completed);
    } catch (error) {
      console.error("Error loading medications:", error);
      Alert.alert(
        "Loading Error",
        "There was a problem loading your medications. Please try again.",
        [
          {
            text: "Retry",
            onPress: () => loadMedications(),
          },
          { text: "OK" },
        ]
      );
    }
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        console.log("Failed to get push notification token");
        return;
      }

      // Use the syncNotificationsWithAppwrite function to handle all notifications
      if (userProfile) {
        await syncNotificationsWithAppwrite(userProfile.userID);
      } else if (user) {
        await syncNotificationsWithAppwrite(user.$id);
      } else {
        console.log("Cannot sync notifications: No authenticated user");
      }
      
    } catch (error) {
      console.error("Error setting up notifications:", error);
    }
  };

  // Use useEffect for initial load
  useEffect(() => {
    const initializeApp = async () => {
      await loadMedications();
      await setupNotifications();
    };
    
    initializeApp();

    // Handle app state changes for notifications
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        loadMedications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Use useFocusEffect for subsequent updates
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = () => {
        // Cleanup if needed
      };

      loadMedications();
      return () => unsubscribe();
    }, [loadMedications])
  );

  const handleTakeDose = async (medication: Medicine | Medication, specificTime?: string) => {
    try {
      console.log('Starting handleTakeDose for:', medication.medicineName, 'at time:', specificTime);
      
      // Get current time
      const now = new Date();
      let timestamp;
      
      if (specificTime) {
        // Parse the scheduled time
        const [scheduledHours, scheduledMinutes] = specificTime.split(':').map(num => parseInt(num, 10));
        
        // Check if the scheduled time is valid
        if (!isNaN(scheduledHours) && !isNaN(scheduledMinutes)) {
          // Create scheduled time for today
          const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), scheduledHours, scheduledMinutes, 0, 0);
          
          // Check if the current time is before the scheduled time
          if (now < scheduledTime) {
            Alert.alert(
              "Cannot Take Dose Yet", 
              `This dose is scheduled for ${specificTime}. You can't mark it as taken before the scheduled time.`
            );
            return; // Exit early
          }
          
          // Use the scheduled time for recording
          timestamp = scheduledTime.toISOString();
        } else {
          // Fallback to current time if time format is invalid
          timestamp = now.toISOString();
        }
      } else {
        timestamp = now.toISOString();
      }
      
      // Check if medication has medicineId (new Appwrite format) or id (legacy format)
      const medicineId = 'medicineId' in medication ? medication.medicineId : (medication as any).id;
      
      if (!medicineId) {
        throw new Error('No valid medicineId found');
      }
      
      console.log('Using medicineId:', medicineId);

      // Get the current user ID
      const currentUser = await account.get();
      if (!currentUser?.$id) {
        throw new Error('User not authenticated');
      }
      
      console.log('User ID:', currentUser.$id);

      // Find the correct reminder for this medicine and time
      const reminderId = await findReminderForMedicineAndTime(
        medicineId,
        currentUser.$id,
        new Date(timestamp)
      );

      if (!reminderId) {
        throw new Error('Could not find or create reminder for this dose');
      }
      
      console.log('Found/created reminder ID:', reminderId);

      // Record the dose using the correct reminder ID
      await recordDoseTaken(reminderId);
      
      console.log('Dose recorded successfully');
      
      // Reload data after recording dose
      await loadMedications(); 
    } catch (error) {
      console.error("Error recording dose:", error);
      
      let errorMessage = "Failed to record dose. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  const isDoseTaken = (medicationId: string, time?: string) => {
    // Find the medication to get its medicineId
    const medication = medications.find(med => med.id === medicationId);
    const actualMedicineId = medication?.medicineId || medicationId;
    
    if (!time) {
      // If no specific time is given, check if any dose for this medication is taken today
      const today = new Date().toDateString();
      return doseHistory.some(
        (dose) => dose.medicationId === actualMedicineId && 
                  dose.taken && 
                  new Date(dose.timestamp).toDateString() === today
      );
    }
    
    // For multi-dose medications, check if the specific time slot has been taken today
    const today = new Date();
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    
    // Create the scheduled time for today
    const scheduledTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0, 0);
    
    return doseHistory.some(dose => {
      if (dose.medicationId === actualMedicineId && dose.taken) {
        const doseDate = new Date(dose.timestamp);
        const doseDateString = doseDate.toDateString();
        const todayString = today.toDateString();
        
        // Only check doses taken today
        if (doseDateString !== todayString) {
          return false;
        }
        
        // For time-specific doses, check if it's within a reasonable window (±2 hours)
        const timeDiff = Math.abs(doseDate.getTime() - scheduledTime.getTime());
        const twoHoursInMs = 2 * 60 * 60 * 1000;
        
        return timeDiff <= twoHoursInMs;
      }
      return false;
    });
  };

  // Calculate total expected doses (sum of all medication times)
  const totalExpectedDoses = todaysMedications.reduce((sum, med) => sum + med.times.length, 0);
  
  const progress =
    totalExpectedDoses > 0
      ? Math.min(completedDoses / totalExpectedDoses, 1) // Cap at 100%
      : 0;

  const NotificationButton = (
    <TouchableOpacity
      style={styles.notificationButton}
      onPress={() => setShowNotifications(true)}
    >
      
      <Ionicons name="notifications-outline" size={24} color="white" />
      {todaysMedications.length > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationCount}>
            {todaysMedications.length}
          </Text>
        </View>
      )}
    
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.container}>
      <Header 
        title="Daily Progress" 
        rightComponent={NotificationButton}
      />
      
      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <View style={styles.progressSection}>
          <CircularProgress
            progress={progress}
            totalDoses={totalExpectedDoses}
            completedDoses={completedDoses}
          />
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={commonStyles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Link href={action.route} key={action.label} asChild>
                <TouchableOpacity style={styles.actionButton}>
                  <LinearGradient
                    colors={action.gradient}
                    style={styles.actionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.actionContent}>
                      <View style={styles.actionIcon}>
                        <Ionicons name={action.icon} size={28} color="white" />
                      </View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={commonStyles.rowBetween}>
            <Text style={commonStyles.sectionTitle}>Today's Schedule</Text>
            <Link href="/calendar" asChild>
              <TouchableOpacity>
                <Text style={[styles.seeAllButton, { color: theme.primary }]}>See All</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          {todaysMedications.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Ionicons 
                name="medical-outline" 
                size={60} 
                color={theme.textTertiary} 
              />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No Medications Today
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                You don't have any medications scheduled for today
              </Text>
              <Button
                title="Add Medication"
                onPress={() => router.push('/medications/add')}
                icon="add-circle-outline"
                size="small"
                style={{ marginTop: spacing.md }}
              />
            </View>
          ) : (
            <View style={styles.medicationsList}>
              {todaysMedications.map((medication) => (
                <Animated.View key={medication.id}>
                  <MedicationCardComponent 
                    medication={medication} 
                    isDoseTaken={isDoseTaken}
                    handleTakeDose={handleTakeDose}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {todaysMedications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyNotificationsText, { color: theme.textSecondary }]}>
                  No notifications for today
                </Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.notificationsContent}
              >
                {todaysMedications.map((medication) => (
                  <NotificationItemComponent 
                    key={medication.id} 
                    medication={medication} 
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  progressSection: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    transform: [{ perspective: 1000 }],
  },
  progressRing3D: {
    borderRadius: width * 0.55,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    backgroundColor: '#fff',
  },
  progressTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    width: '100%',
    height: '100%',
  },
  progressPercentage: {
    fontSize: 42,
    fontWeight: "bold",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressDetails: {
    fontSize: typography.body.fontSize,
    marginTop: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressRing: {
    transform: [{ rotate: "-90deg" }],
  },
  dialIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 4,
    height: 30,
    marginLeft: -2,
    marginTop: -15,
    borderRadius: 2,
    zIndex: 1,
  },
  notificationButton: {
    position: "relative",
    padding: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: borderRadius.medium,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f04a5b",
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  quickActionsContainer: {
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    height: 110,
    borderRadius: borderRadius.large,
    overflow: "hidden",
    ...shadow.medium,
    marginBottom: spacing.xs,
  },
  actionGradient: {
    flex: 1,
    padding: spacing.md,
  },
  actionContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    ...shadow.small,
  },
  actionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: "white",
    marginTop: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  seeAllButton: {
    fontWeight: "600",
    fontSize: typography.body.fontSize,
  },
  medicationsList: {
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: "white",
    borderRadius: borderRadius.large,
    marginTop: spacing.md,
    ...shadow.small,
  },
  emptyStateTitle: {
    fontSize: typography.title.fontSize,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: typography.body.fontSize,
    color: "#666",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.large,
    borderTopRightRadius: borderRadius.large,
    padding: spacing.lg,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.subheader.fontSize,
    fontWeight: typography.subheader.fontWeight,
  },
  closeButton: {
    padding: spacing.xs,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationItem: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.subheader.fontSize,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: typography.caption.fontSize,
    fontWeight: "500",
  },
  emptyNotifications: {
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyNotificationsText: {
    fontSize: typography.body.fontSize,
    marginTop: spacing.md,
    textAlign: "center",
  },
  notificationsList: {
    flex: 1,
    maxHeight: Dimensions.get('window').height * 0.6, // 60% of screen height
  },
  notificationsContent: {
    paddingBottom: spacing.md,
  },
  medicationCard: {
    marginBottom: spacing.md,
  },
  elegantMedicationCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.large,
    overflow: "hidden",
    ...shadow.medium,
    borderWidth: 1,
    borderColor: "transparent",
    transform: [{ translateY: 0 }], // For animation purposes
  },
  medicationCardContent: {
    padding: spacing.md,
    position: "relative",
  },
  medicationColorAccent: {
    position: "absolute",
    left: 0,
    top: 6,
    bottom: 6,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  medicationColorBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  medicationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingLeft: spacing.md,
  },
  medicationName: {
    fontSize: typography.subheader.fontSize,
    fontWeight: "700",
    marginBottom: spacing.xs / 2,
  },
  medicationDosage: {
    fontSize: typography.caption.fontSize,
    opacity: 0.8,
  },
  takenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  takenText: {
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
    marginLeft: spacing.xs / 2,
  },
  medicationCardDetails: {
    marginTop: spacing.md,
    paddingLeft: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: spacing.sm,
  },
  medicationTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  medicationTime: {
    fontSize: typography.body.fontSize,
    marginLeft: spacing.sm,
  },
  timeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  takeDoseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
    borderRadius: borderRadius.pill,
    ...shadow.medium,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    elevation: 2,
  },
  takeDoseText: {
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
    color: "white",
    marginLeft: spacing.xs / 2,
  },
  doseTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  doseTakenBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  doseTakenText: {
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
    marginLeft: spacing.xs / 2,
  }
});
