// Temporary fallback for expo-calendar when native module is not available
import { Platform } from 'react-native';

// Mock calendar permissions
export async function requestCalendarPermissions(): Promise<boolean> {
  console.warn('⚠️ Calendar module not available - using fallback');
  return false; // Always return false to force notifications-only mode
}

// Mock calendar functions
export async function scheduleHybridMedicineReminders(medicine: any): Promise<{
  success: boolean;
  calendarEventIds: string[];
  error?: string;
}> {
  console.warn('⚠️ Calendar scheduling not available - falling back to notifications');
  return {
    success: false,
    calendarEventIds: [],
    error: 'Calendar module not available'
  };
}

export async function cancelMedicineCalendarEvents(medicine: any): Promise<boolean> {
  console.warn('⚠️ Calendar cancellation not available');
  return true; // Return true since there's nothing to cancel
}

export async function maintainCalendarEvents(): Promise<void> {
  console.warn('⚠️ Calendar maintenance not available');
}

export async function getUpcomingMedicationEvents(days: number): Promise<any[]> {
  console.warn('⚠️ Calendar events retrieval not available');
  return [];
}

export async function getOrCreateMedRemindCalendar(): Promise<string | null> {
  console.warn('⚠️ Calendar creation not available');
  return null;
}
