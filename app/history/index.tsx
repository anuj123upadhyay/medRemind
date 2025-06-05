import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getUserMedicines,
} from "../../services/medicationService";
import { 
  getReminderHistory 
} from "../../services/doseHistoryService";
import { Medicine } from "../../services/collections";
import { account } from "../../services/appwrite";
import { useTheme } from "../../utils/ThemeContext";
import {
  borderRadius,
  createCommonStyles,
  shadow,
  spacing,
  typography,
} from "../../utils/StyleSystem";
import Header from "../../components/Header";
import Button from "../../components/Button";

// Legacy type definitions for transition period
interface Medication {
  id: string;
  name: string;
  medicineName: string;
  dosage: string;
  times: string[];
  startDate: string;
  duration: string;
  color: string;
  reminderEnabled: boolean;
  currentSupply: number;
  totalSupply: number;
  refillAt: number;
  refillReminder: boolean;
  lastRefillDate?: string;
  medicineId: string;
}

interface DoseHistory {
  id: string;
  medicationId: string;
  timestamp: string;
  taken: boolean;
}

type EnrichedDoseHistory = DoseHistory & { medication?: Medication };

export default function HistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [history, setHistory] = useState<EnrichedDoseHistory[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "taken" | "missed"
  >("all");
  const commonStyles = createCommonStyles(theme);

  const loadHistory = useCallback(async () => {
    try {
      // Get current user ID for reminder history
      const userId = (await account.get()).$id;
      
      // Get all-time history
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1); // Get past year of data
      
      const [allMedicines, reminderHistory] = await Promise.all([
        getUserMedicines(),
        getReminderHistory(userId, startDate, endDate),
      ]);

      // Convert Medicine objects to Medication format for compatibility
      const convertedMedications: Medication[] = allMedicines.map((medicine: any) => ({
        ...medicine,
        id: medicine.$id,
        name: medicine.medicineName,
        medicineId: medicine.$id,
        startDate: new Date(medicine.startDate).toISOString(),
        duration: medicine.duration === -1 ? "Ongoing" : `${medicine.duration} days`,
        color: medicine.color || "#E91E63",
      }));

      // Convert reminder history to DoseHistory format
      const convertedDoseHistory: DoseHistory[] = reminderHistory.map((reminder: any) => ({
        id: reminder.$id,
        medicationId: reminder.medicineId,
        timestamp: new Date(reminder.scheduledTime || new Date()).toISOString(),
        taken: reminder.status === 'taken'
      }));

      // Combine history with medication details
      const enrichedHistory = convertedDoseHistory.map((dose) => ({
        ...dose,
        medication: convertedMedications.find((med) => med.medicineId === dose.medicationId),
      }));

      setHistory(enrichedHistory);
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Error", "Failed to load medication history. Please try again.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const groupHistoryByDate = () => {
    const grouped = history.reduce((acc, dose) => {
      const date = new Date(dose.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(dose);
      return acc;
    }, {} as Record<string, EnrichedDoseHistory[]>);

    return Object.entries(grouped).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const filteredHistory = history.filter((dose) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "taken") return dose.taken;
    if (selectedFilter === "missed") return !dose.taken;
    return true;
  });

  const groupedHistory = groupHistoryByDate();

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to clear all medication data? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              // For now, just show a message that this feature needs to be implemented
              // In a full implementation, you would call Appwrite delete functions
              Alert.alert("Feature Not Available", "Data clearing functionality will be implemented with proper Appwrite data management.");
              await loadHistory();
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <Header title="History Log" onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === "all" && styles.filterButtonActive,
                { borderColor: theme.border },
                selectedFilter === "all" && {
                  borderColor: theme.primary,
                  backgroundColor: theme.primary + "10",
                },
              ]}
              onPress={() => setSelectedFilter("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.text },
                  selectedFilter === "all" && { color: theme.primary },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === "taken" && styles.filterButtonActive,
                { borderColor: theme.border },
                selectedFilter === "taken" && {
                  borderColor: theme.success,
                  backgroundColor: theme.success + "10",
                },
              ]}
              onPress={() => setSelectedFilter("taken")}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.text },
                  selectedFilter === "taken" && { color: theme.success },
                ]}
              >
                Taken
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === "missed" && styles.filterButtonActive,
                { borderColor: theme.border },
                selectedFilter === "missed" && {
                  borderColor: theme.error,
                  backgroundColor: theme.error + "10",
                },
              ]}
              onPress={() => setSelectedFilter("missed")}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: theme.text },
                  selectedFilter === "missed" && { color: theme.error },
                ]}
              >
                Missed
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView
          style={styles.historyContainer}
          showsVerticalScrollIndicator={false}
        >
          {groupedHistory.length > 0 ? (
            groupedHistory.map(([date, doses]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={[styles.dateHeader, { color: theme.text }]}>
                  {new Date(date).toLocaleDateString("default", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                {doses
                  .filter((dose) => {
                    if (selectedFilter === "all") return true;
                    if (selectedFilter === "taken") return dose.taken;
                    if (selectedFilter === "missed") return !dose.taken;
                    return true;
                  })
                  .map((dose) => (
                    <View
                      key={dose.id}
                      style={[
                        styles.historyCard,
                        {
                          backgroundColor: theme.card,
                          ...shadow.small,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusIndicator,
                          {
                            backgroundColor: dose.taken
                              ? theme.success
                              : theme.error,
                          },
                        ]}
                      />
                      <View style={styles.cardContent}>
                        <View style={styles.medicationInfo}>
                          <Text
                            style={[styles.medicationName, { color: theme.text }]}
                          >
                            {dose.medication?.name || "Unknown Medication"}
                          </Text>
                          <Text
                            style={[
                              styles.dosageText,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {dose.medication?.dosage || ""}
                          </Text>
                        </View>
                        <View style={styles.timeInfo}>
                          <Text
                            style={[
                              styles.timeText,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {new Date(dose.timestamp).toLocaleTimeString(
                              "default",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: dose.taken
                                  ? theme.success + "15"
                                  : theme.error + "15",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color: dose.taken
                                    ? theme.success
                                    : theme.error,
                                },
                              ]}
                            >
                              {dose.taken ? "Taken" : "Missed"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={64}
                color={theme.textTertiary}
              />
              <Text
                style={[styles.emptyStateText, { color: theme.textSecondary }]}
              >
                No medication history yet
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: theme.textTertiary },
                ]}
              >
                Your medication history will appear here once you start tracking
                doses
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Clear All Data"
            onPress={handleClearAllData}
            variant="outline"
            icon="trash-outline"
            style={{ borderColor: theme.error, alignSelf: "center" }}
            textStyle={{ color: theme.error }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  filtersContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  filterButtonActive: {
    borderWidth: 1,
  },
  filterText: {
    ...typography.body,
  },
  filterTextActive: {
    fontWeight: "bold",
  },
  historyContainer: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    ...typography.subheader,
    marginBottom: spacing.sm,
  },
  historyCard: {
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    flexDirection: "row",
    overflow: "hidden",
  },
  statusIndicator: {
    width: 8,
    height: "100%",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  dosageText: {
    ...typography.body,
  },
  timeInfo: {
    alignItems: "flex-end",
  },
  timeText: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    ...typography.subheader,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    ...typography.body,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});