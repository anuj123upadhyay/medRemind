import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { addMedicine } from "../../services/medicationService";
import {
  scheduleMedicineReminders,
  scheduleRefillReminder,
} from "../../utils/notifications";
import { useTheme } from "../../utils/ThemeContext";
import { borderRadius, createCommonStyles, shadow, spacing, typography } from "../../utils/StyleSystem";
import Header from "../../components/Header";
import Button from "../../components/Button";
import TextField from "../../components/TextField";

const { width } = Dimensions.get("window");

const FREQUENCIES = [
  {
    id: "1",
    label: "Once daily",
    icon: "sunny-outline" as const,
    times: ["09:00"],
  },
  {
    id: "2",
    label: "Twice daily",
    icon: "sync-outline" as const,
    times: ["09:00", "21:00"],
  },
  {
    id: "3",
    label: "Three times daily",
    icon: "time-outline" as const,
    times: ["09:00", "15:00", "21:00"],
  },
  {
    id: "4",
    label: "Four times daily",
    icon: "repeat-outline" as const,
    times: ["09:00", "13:00", "17:00", "21:00"],
  },
  { id: "5", label: "As needed", icon: "calendar-outline" as const, times: [] },
];

const DURATIONS = [
  { id: "1", label: "7 days", value: 7 },
  { id: "2", label: "14 days", value: 14 },
  { id: "3", label: "30 days", value: 30 },
  { id: "4", label: "90 days", value: 90 },
  { id: "5", label: "Ongoing", value: -1 },
];

const COLORS = [
  "#E91E63", // Pink
  "#9C27B0", // Purple
  "#3F51B5", // Indigo
  "#2196F3", // Blue
  "#00BCD4", // Cyan
  "#009688", // Teal
  "#4CAF50", // Green
  "#CDDC39", // Lime
  "#FFC107", // Amber
  "#FF9800", // Orange
  "#FF5722", // Deep Orange
  "#795548", // Brown
];

export default function AddMedicationScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const commonStyles = createCommonStyles(theme);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    startDate: new Date(),
    times: ["09:00"],
    notes: "",
    reminderEnabled: true,
    refillReminder: false,
    currentSupply: "",
    totalSupply: "",
    refillAt: "20",
    color: COLORS[0],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    console.log("Validating form...");
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) {
      console.log("Name validation failed");
      newErrors.name = "Medication name is required";
    }

    if (!form.dosage.trim()) {
      console.log("Dosage validation failed");
      newErrors.dosage = "Dosage is required";
    }

    if (!selectedFrequency) {
      console.log("Frequency validation failed - selectedFrequency:", selectedFrequency);
      newErrors.frequency = "Frequency is required";
    }

    if (!selectedDuration) {
      console.log("Duration validation failed - selectedDuration:", selectedDuration);
      newErrors.duration = "Duration is required";
    }

    if (form.refillReminder) {
      if (!form.currentSupply.trim() || isNaN(Number(form.currentSupply))) {
        console.log("Current supply validation failed");
        newErrors.currentSupply = "Valid current supply is required";
      }

      if (!form.totalSupply.trim() || isNaN(Number(form.totalSupply))) {
        console.log("Total supply validation failed");
        newErrors.totalSupply = "Valid total supply is required";
      }

      if (Number(form.currentSupply) > Number(form.totalSupply)) {
        console.log("Supply comparison validation failed");
        newErrors.currentSupply = "Current supply cannot exceed total supply";
      }
    }

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    console.log("Validation result:", Object.keys(newErrors).length === 0);
    
    // Show alert for validation errors to make them more visible
    if (Object.keys(newErrors).length > 0) {
      const errorMessages = Object.values(newErrors);
      Alert.alert(
        "Please Complete Required Fields", 
        errorMessages.join('\n'), 
        [{ text: "OK" }]
      );
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleFrequencySelect = (frequency: typeof FREQUENCIES[0]) => {
    setSelectedFrequency(frequency.id);
    setForm({
      ...form,
      frequency: frequency.label,
      times: [...frequency.times],
    });
  };

  const handleDurationSelect = (duration: typeof DURATIONS[0]) => {
    setSelectedDuration(duration.id);
    setForm({
      ...form,
      duration: duration.label,
    });
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, "0");
      const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;

      const newTimes = [...form.times];
      newTimes[selectedTimeIndex] = timeString;

      setForm({
        ...form,
        times: newTimes,
      });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({
        ...form,
        startDate: selectedDate,
      });
    }
  };

  const handleAddTime = () => {
    setForm({
      ...form,
      times: [...form.times, "12:00"],
    });
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = [...form.times];
    newTimes.splice(index, 1);
    setForm({
      ...form,
      times: newTimes,
    });
  };

  const handleShowTimePicker = (index: number) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  const handleSubmit = async () => {
    console.log("Add Medication button pressed");
    console.log("Form data:", form);
    console.log("Selected frequency:", selectedFrequency);
    console.log("Selected duration:", selectedDuration);
    
    if (!validateForm()) {
      console.log("Form validation failed");
      console.log("Errors:", errors);
      // Scroll to the first error
      return;
    }

    console.log("Form validation passed, submitting...");
    setIsSubmitting(true);

    try {
      const newMedication = {
        medicineName: form.name,
        dosage: form.dosage,
        frequency: selectedFrequency === "5" ? "as_needed" : "daily", // Map frequency properly
        times: form.times,
        startDate: form.startDate,
        isActive: true,
        reminderEnabled: form.reminderEnabled,
        color: form.color,
        duration: selectedDuration === "5" ? -1 : parseInt(form.duration.split(" ")[0]), // Parse duration properly
        currentSupply: form.refillReminder ? Number(form.currentSupply) : 0,
        totalSupply: form.refillReminder ? Number(form.totalSupply) : 0,
        refillAt: form.refillReminder ? Number(form.refillAt) : 20,
        refillReminder: form.refillReminder,
        notes: form.notes,
        userId: "", // Will be overridden by the service
      };

      // Use the Appwrite service to add the medicine
      const savedMedicine = await addMedicine(newMedication);

      // Convert to Medicine interface for notifications - use the returned medicine data
      const medicineForNotifications = {
        medicineId: savedMedicine.medicineId,
        userId: savedMedicine.userId,
        medicineName: savedMedicine.medicineName,
        dosage: savedMedicine.dosage,
        frequency: savedMedicine.frequency,
        times: savedMedicine.times,
        startDate: savedMedicine.startDate,
        isActive: savedMedicine.isActive,
        reminderEnabled: savedMedicine.reminderEnabled,
        color: savedMedicine.color,
        duration: savedMedicine.duration,
        currentSupply: savedMedicine.currentSupply,
        totalSupply: savedMedicine.totalSupply,
        refillAt: savedMedicine.refillAt,
        refillReminder: savedMedicine.refillReminder,
        notes: savedMedicine.notes,
      };

      if (form.reminderEnabled) {
        console.log('=== SCHEDULING MEDICINE REMINDERS ===');
        console.log('Medicine data for notifications:', JSON.stringify(medicineForNotifications, null, 2));
        console.log('Reminder times:', medicineForNotifications.times);
        console.log('Current time:', new Date().toLocaleString());
        
        try {
          const notificationIds = await scheduleMedicineReminders(medicineForNotifications);
          console.log('Successfully scheduled notification IDs:', notificationIds);
          
          // Verify notifications were scheduled correctly
          setTimeout(async () => {
            const { debugScheduledNotifications } = await import('../../utils/notifications');
            await debugScheduledNotifications();
          }, 1000);
        } catch (error) {
          console.error('Error scheduling medicine reminders:', error);
          Alert.alert('Notification Error', 'Failed to schedule reminders. Notifications may not work properly.');
        }
      }

      if (form.refillReminder) {
        console.log('=== SCHEDULING REFILL REMINDER ===');
        try {
          const refillId = await scheduleRefillReminder(medicineForNotifications);
          console.log('Refill reminder scheduled with ID:', refillId);
        } catch (error) {
          console.error('Error scheduling refill reminder:', error);
        }
      }

      Alert.alert(
        "Success",
        "Medication was added successfully",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error adding medication:", error);
      Alert.alert("Error", "Failed to add medication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Header
        title="Add Medication"
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Medication Details
        </Text>

        {/* Medication Name */}
        <TextField
          label="Medication Name *"
          placeholder="Enter medication name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          error={errors.name}
          leftIcon="medical-outline"
          containerStyle={styles.inputContainer}
        />

        {/* Dosage */}
        <TextField
          label="Dosage *"
          placeholder="e.g., 10mg, 1 pill, 5ml"
          value={form.dosage}
          onChangeText={(text) => setForm({ ...form, dosage: text })}
          error={errors.dosage}
          leftIcon="flask-outline"
          containerStyle={styles.inputContainer}
        />

        {/* Color Selection */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>Color</Text>
        <View style={styles.colorContainer}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                form.color === color && styles.colorSelected,
              ]}
              onPress={() => setForm({ ...form, color: color })}
            >
              {form.color === color && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Frequency */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Frequency
          {errors.frequency && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {" - "}
              {errors.frequency}
            </Text>
          )}
        </Text>
        <View style={styles.optionsContainer}>
          {FREQUENCIES.map((frequency) => (
            <TouchableOpacity
              key={frequency.id}
              style={[
                styles.optionButton,
                selectedFrequency === frequency.id && styles.optionSelected,
                { 
                  backgroundColor: theme.card,
                  borderColor: selectedFrequency === frequency.id ? theme.primary : theme.border 
                }
              ]}
              onPress={() => handleFrequencySelect(frequency)}
            >
              <Ionicons
                name={frequency.icon}
                size={24}
                color={
                  selectedFrequency === frequency.id
                    ? theme.primary
                    : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.optionText,
                  selectedFrequency === frequency.id && { fontWeight: "bold" },
                  { color: selectedFrequency === frequency.id ? theme.primary : theme.text }
                ]}
              >
                {frequency.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Times */}
        {form.times.length > 0 && (
          <View style={styles.timesContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Times
            </Text>
            {form.times.map((time, index) => (
              <View key={index} style={styles.timeItem}>
                <TouchableOpacity
                  style={[
                    styles.timeButton,
                    { backgroundColor: theme.card, borderColor: theme.border }
                  ]}
                  onPress={() => handleShowTimePicker(index)}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={theme.textSecondary}
                  />
                  <Text style={[styles.timeText, { color: theme.text }]}>
                    {time}
                  </Text>
                </TouchableOpacity>

                {form.times.length > 1 && (
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: theme.error }]}
                    onPress={() => handleRemoveTime(index)}
                  >
                    <Ionicons name="trash-outline" size={18} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <Button
              title="Add Time"
              variant="outline"
              icon="add-outline"
              size="small"
              onPress={handleAddTime}
              style={styles.addTimeButton}
            />
          </View>
        )}

        {/* Start Date */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Start Date
        </Text>
        <TouchableOpacity
          style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.textSecondary}
          />
          <Text style={[styles.dateText, { color: theme.text }]}>
            {form.startDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {/* Duration */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>
          Duration
          {errors.duration && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {" - "}
              {errors.duration}
            </Text>
          )}
        </Text>
        <View style={styles.optionsContainer}>
          {DURATIONS.map((duration) => (
            <TouchableOpacity
              key={duration.id}
              style={[
                styles.optionButton,
                selectedDuration === duration.id && styles.optionSelected,
                { 
                  backgroundColor: theme.card, 
                  borderColor: selectedDuration === duration.id ? theme.primary : theme.border 
                }
              ]}
              onPress={() => handleDurationSelect(duration)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedDuration === duration.id && { fontWeight: "bold" },
                  { color: selectedDuration === duration.id ? theme.primary : theme.text }
                ]}
              >
                {duration.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminders */}
        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={[styles.switchLabel, { color: theme.text }]}>
                Enable Reminders
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Get notifications when it's time to take this medication
              </Text>
            </View>
            <Switch
              value={form.reminderEnabled}
              onValueChange={(value) =>
                setForm({ ...form, reminderEnabled: value })
              }
              trackColor={{ false: theme.border, true: theme.primary + '70' }}
              thumbColor={form.reminderEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Supply Tracking */}
        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={[styles.switchLabel, { color: theme.text }]}>
                Track Supply
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Track medication supply and get refill reminders
              </Text>
            </View>
            <Switch
              value={form.refillReminder}
              onValueChange={(value) =>
                setForm({ ...form, refillReminder: value })
              }
              trackColor={{ false: theme.border, true: theme.primary + '70' }}
              thumbColor={form.refillReminder ? theme.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {form.refillReminder && (
          <>
            <View style={styles.supplyContainer}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <TextField
                  label="Current Supply"
                  placeholder="How many do you have now?"
                  value={form.currentSupply}
                  onChangeText={(text) => setForm({ ...form, currentSupply: text })}
                  error={errors.currentSupply}
                  keyboardType="numeric"
                  leftIcon="calculator-outline"
                />
              </View>

              <View style={{ flex: 1 }}>
                <TextField
                  label="Total Supply"
                  placeholder="Full package amount"
                  value={form.totalSupply}
                  onChangeText={(text) => setForm({ ...form, totalSupply: text })}
                  error={errors.totalSupply}
                  keyboardType="numeric"
                  leftIcon="calculator-outline"
                />
              </View>
            </View>
            
            <View style={styles.supplyRefillContainer}>
              <TextField
                label="Refill Reminder (%)"
                placeholder="Percentage to remind at"
                value={form.refillAt}
                onChangeText={(text) => setForm({ ...form, refillAt: text })}
                keyboardType="numeric"
                leftIcon="notifications-outline"
                helper="You'll be notified when supply drops below this percentage"
              />
            </View>
          </>
        )}

        {/* Notes */}
        <TextField
          // label="Notes (Optional)"
          placeholder="Add any additional information"
          value={form.notes}
          onChangeText={(text) => setForm({ ...form, notes: text })}
          multiline
          numberOfLines={4}
          containerStyle={{ marginTop: spacing.md }}
          leftIcon="document-text-outline"
        />

        <Button
          title={isSubmitting ? "Adding..." : "Add Medication"}
          onPress={() => {
            console.log("Button onPress triggered");
            handleSubmit();
          }}
          loading={isSubmitting}
          disabled={isSubmitting}
          variant="primary"
          icon="add-circle-outline"
          style={styles.submitButton}
          fullWidth
        />
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <View style={styles.pickerModalContainer}>
          <BlurView intensity={80} style={styles.blurView} />
          <View style={[styles.pickerContainer, { backgroundColor: theme.card }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>
                Select Time
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={(() => {
                const [hours, minutes] = form.times[selectedTimeIndex]
                  .split(":")
                  .map(Number);
                const date = new Date();
                date.setHours(hours, minutes, 0, 0);
                return date;
              })()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
              themeVariant={isDark ? "dark" : "light"}
            />
          </View>
        </View>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <View style={styles.pickerModalContainer}>
          <BlurView intensity={80} style={styles.blurView} />
          <View style={[styles.pickerContainer, { backgroundColor: theme.card }]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, { color: theme.text }]}>
                Select Start Date
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={form.startDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              minimumDate={new Date()}
              themeVariant={isDark ? "dark" : "light"}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.header,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    fontWeight: 'normal',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: 'white',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    minWidth: width / 2 - spacing.lg,
  },
  optionSelected: {
    borderWidth: 2,
  },
  optionText: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
  timesContainer: {
    marginBottom: spacing.md,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    flex: 1,
  },
  timeText: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  addTimeButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
  switchContainer: {
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    ...typography.title,
    marginBottom: spacing.xs / 2,
  },
  switchDescription: {
    ...typography.caption,
  },
  supplyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  supplyRefillContainer: {
    marginBottom: spacing.md,
  },
  supplyInput: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginVertical: spacing.lg,
    height: 50,
  },
  pickerModalContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pickerContainer: {
    width: '80%',
    borderRadius: borderRadius.large,
    padding: spacing.md,
    ...shadow.large,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pickerTitle: {
    ...typography.subheader,
  },
});