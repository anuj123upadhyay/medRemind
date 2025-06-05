import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getUserMedicines,
  updateMedicine,
} from "../../services/medicationService";
import { Medicine } from "../../services/collections";
import { scheduleRefillReminder } from "../../utils/notifications";
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

// Legacy type for compatibility with existing UI components
interface Medication extends Medicine {
  id: string; // For UI component compatibility 
  name: string; // Map from medicineName
}

export default function RefillTrackerScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [medications, setMedications] = useState<Medication[]>([]);
  const commonStyles = createCommonStyles(theme);

  const loadMedications = useCallback(async () => {
    try {
      const allMedicines = await getUserMedicines();
      
      // Filter only medications with supply tracking enabled and convert to UI format
      const medicationsWithSupply = allMedicines
        .filter((medicine: any) => medicine.refillReminder && medicine.totalSupply > 0)
        .map((medicine: any) => ({
          ...medicine,
          id: medicine.$id, // Use Appwrite document ID
          name: medicine.medicineName, // Map medicineName to name for UI compatibility
        })) as Medication[];
        
      setMedications(medicationsWithSupply);
    } catch (error) {
      console.error("Error loading medications:", error);
      Alert.alert("Error", "Failed to load medications. Please try again.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications])
  );

  const handleRefill = async (medication: Medication) => {
    try {
      // Use the Appwrite document ID for updates
      const updateData = {
        currentSupply: medication.totalSupply || 0,
        lastRefillDate: new Date(),
      };

      await updateMedicine(medication.id, updateData);
      await loadMedications();

      Alert.alert(
        "Refill Recorded",
        `${medication.name} has been refilled to ${medication.totalSupply || 0} units.`
      );
    } catch (error) {
      console.error("Error recording refill:", error);
      Alert.alert("Error", "Failed to record refill. Please try again.");
    }
  };

  const getSupplyStatus = (medication: Medication) => {
    const currentSupply = medication.currentSupply || 0;
    const totalSupply = medication.totalSupply || 1;
    const refillAt = medication.refillAt || 20;
    
    const percentage = (currentSupply / totalSupply) * 100;
    if (percentage <= refillAt) {
      return {
        status: "Low",
        color: theme.error,
        backgroundColor: theme.error + "10",
      };
    } else if (percentage <= 50) {
      return {
        status: "Medium",
        color: theme.warning,
        backgroundColor: theme.warning + "10",
      };
    } else {
      return {
        status: "Good",
        color: theme.success,
        backgroundColor: theme.success + "10",
      };
    }
  };

  return (
    <View style={commonStyles.container}>
      <Header title="Refill Tracker" onBack={() => router.back()} />

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Medication Supply
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Track and manage your medication supplies
        </Text>

        <ScrollView
          style={styles.medicationsList}
          showsVerticalScrollIndicator={false}
        >
          {medications.length > 0 ? (
            medications.map((medication) => {
              const currentSupply = medication.currentSupply || 0;
              const totalSupply = medication.totalSupply || 1;
              const refillAt = medication.refillAt || 20;
              
              const supplyPercentage = Math.round(
                (currentSupply / totalSupply) * 100
              );
              const supplyStatus = getSupplyStatus(medication);
              const lastRefillDate = medication.lastRefillDate
                ? new Date(medication.lastRefillDate).toLocaleDateString()
                : "Never";

              return (
                <View
                  key={medication.id}
                  style={[
                    styles.medicationCard,
                    { backgroundColor: theme.card, ...shadow.small },
                  ]}
                >
                  <View style={styles.medicationHeader}>
                    <View style={styles.medicationInfo}>
                      <Text
                        style={[styles.medicationName, { color: theme.text }]}
                      >
                        {medication.name}
                      </Text>
                      <Text
                        style={[
                          styles.medicationDosage,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {medication.dosage}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: supplyStatus.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: supplyStatus.color },
                        ]}
                      >
                        {supplyStatus.status}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.progressBarContainer,
                      { backgroundColor: theme.border + "40" },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${supplyPercentage}%`,
                          backgroundColor: supplyStatus.color,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.supplyDetails}>
                    <Text
                      style={[styles.supplyText, { color: theme.textSecondary }]}
                    >
                      {currentSupply} of {totalSupply}{" "}
                      remaining
                    </Text>
                    <Text style={[styles.percentText, { color: theme.text }]}>
                      {supplyPercentage}%
                    </Text>
                  </View>

                  <View style={styles.refillInfo}>
                    <Text
                      style={[
                        styles.refillLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Last refill: {lastRefillDate}
                    </Text>
                    <Text
                      style={[
                        styles.refillLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Refill reminder at: {refillAt}%
                    </Text>
                  </View>

                  <Button
                    title="Record Refill"
                    variant="primary"
                    icon="flask-outline"
                    onPress={() => handleRefill(medication)}
                    fullWidth
                    style={styles.refillButton}
                  />
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="flask-outline"
                size={64}
                color={theme.textTertiary}
              />
              <Text
                style={[styles.emptyStateText, { color: theme.textSecondary }]}
              >
                No medications to track
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: theme.textTertiary },
                ]}
              >
                Add medications with supply tracking to see them here
              </Text>
              <Button
                title="Add Medication"
                onPress={() => router.push("/medications/add")}
                variant="primary"
                icon="add-circle-outline"
                style={{ marginTop: spacing.lg }}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.primary}
          />
          <Text
            style={[styles.infoText, { color: theme.textSecondary }]}
          >
            Record refills when you get new medication. Supply will be set to
            your maximum value.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.header,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  medicationsList: {
    flex: 1,
  },
  medicationCard: {
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...typography.title,
    marginBottom: spacing.xs / 2,
  },
  medicationDosage: {
    ...typography.body,
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
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginVertical: spacing.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  supplyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  supplyText: {
    ...typography.body,
  },
  percentText: {
    ...typography.body,
    fontWeight: "bold",
  },
  refillInfo: {
    marginBottom: spacing.md,
  },
  refillLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  refillButton: {
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.subheader,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginTop: spacing.md,
  },
  infoText: {
    ...typography.caption,
    flex: 1,
    marginLeft: spacing.sm,
  },
});