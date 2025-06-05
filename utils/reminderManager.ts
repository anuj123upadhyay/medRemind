// Comprehensive Medication Reminder Management System
// Implements hybrid approach: expo-calendar (primary) + expo-notifications (backup)
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medicine, Reminder } from '../services/collections';
import { account } from '../services/appwrite';
import { getUserMedicines, updateMedicine } from '../services/medicationService';
import { 
  scheduleMedicineReminders,
  scheduleNotification,
  cancelMedicineNotifications
} from './notifications';

// Calendar imports with fallback handling
let Calendar: any = null;
let calendarFunctions: any = {};

try {
  Calendar = require('expo-calendar');
  calendarFunctions = require('./calendarNotifications');
} catch (error) {
  console.warn('⚠️ expo-calendar not available, using fallback:', error instanceof Error ? error.message : 'Unknown error');
  calendarFunctions = require('./calendarFallback');
}

const {
  scheduleHybridMedicineReminders,
  cancelMedicineCalendarEvents,
  maintainCalendarEvents,
  getUpcomingMedicationEvents,
  requestCalendarPermissions,
  getOrCreateMedRemindCalendar
} = calendarFunctions;

// System configuration
const SYSTEM_CONFIG = {
  primaryMethod: 'calendar',
  fallbackMethod: 'notifications',
  maintenanceInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxNotificationDays: 7, // Max days of backup notifications
  calendarDaysAhead: 30, // Days ahead to schedule calendar events
  cleanupThreshold: 2, // Days before cleaning old events/notifications
};

// Reminder management state
interface ReminderSystemState {
  isInitialized: boolean;
  calendarPermission: boolean;
  notificationPermission: boolean;
  lastMaintenance: Date | null;
  activeMedicines: Medicine[];
  systemStatus: 'healthy' | 'degraded' | 'failed';
}

let systemState: ReminderSystemState = {
  isInitialized: false,
  calendarPermission: false,
  notificationPermission: false,
  lastMaintenance: null,
  activeMedicines: [],
  systemStatus: 'failed',
};

// Initialize the reminder system
export async function initializeReminderSystem(): Promise<boolean> {
  try {
    console.log('🚀 Initializing Hybrid Reminder System...');
    
    // Check and request calendar permissions
    systemState.calendarPermission = await requestCalendarPermissions();
    console.log(`📅 Calendar permissions: ${systemState.calendarPermission ? 'Granted' : 'Denied'}`);
    
    // Check and request notification permissions
    const notifSettings = await Notifications.getPermissionsAsync();
    if (!notifSettings.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      systemState.notificationPermission = requested.granted;
    } else {
      systemState.notificationPermission = true;
    }
    console.log(`🔔 Notification permissions: ${systemState.notificationPermission ? 'Granted' : 'Denied'}`);
    
    // Determine system status
    if (systemState.calendarPermission && systemState.notificationPermission) {
      systemState.systemStatus = 'healthy';
    } else if (systemState.calendarPermission || systemState.notificationPermission) {
      systemState.systemStatus = 'degraded';
    } else {
      systemState.systemStatus = 'failed';
    }
    
    // Load active medicines
    try {
      const user = await account.get();
      const medicineDocuments = await getUserMedicines(true);
      systemState.activeMedicines = medicineDocuments.map(doc => doc as unknown as Medicine);
    } catch (error) {
      console.warn('Could not load medicines during initialization:', error);
      systemState.activeMedicines = [];
    }
    
    systemState.isInitialized = true;
    systemState.lastMaintenance = new Date();
    
    console.log(`✅ Reminder system initialized with status: ${systemState.systemStatus}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize reminder system:', error);
    systemState.systemStatus = 'failed';
    return false;
  }
}

// Get current system status
export function getSystemStatus(): ReminderSystemState {
  return { ...systemState };
}

// Determine optimal reminder method for a medicine
function determineReminderMethod(medicine: Medicine): 'hybrid' | 'calendar-only' | 'notifications-only' {
  // Use existing preference if set and permissions support it
  if (medicine.reminderMethod) {
    switch (medicine.reminderMethod) {
      case 'hybrid':
        return systemState.calendarPermission && systemState.notificationPermission ? 'hybrid' : 
               systemState.calendarPermission ? 'calendar-only' : 'notifications-only';
      case 'calendar-only':
        return systemState.calendarPermission ? 'calendar-only' : 'notifications-only';
      case 'notifications-only':
        return 'notifications-only';
    }
  }
  
  // Auto-select based on available permissions
  if (systemState.calendarPermission && systemState.notificationPermission) {
    return 'hybrid';
  } else if (systemState.calendarPermission) {
    return 'calendar-only';
  } else {
    return 'notifications-only';
  }
}

// Schedule comprehensive reminders for a medicine
export async function scheduleComprehensiveMedicineReminders(medicine: Medicine): Promise<{
  success: boolean;
  calendarEventIds?: string[];
  notificationIds?: string[];
  method: string;
  error?: string;
}> {
  try {
    if (!systemState.isInitialized) {
      await initializeReminderSystem();
    }
    
    const method = determineReminderMethod(medicine);
    console.log(`📋 Scheduling reminders for ${medicine.medicineName} using method: ${method}`);
    
    let calendarEventIds: string[] = [];
    let notificationIds: string[] = [];
    
    switch (method) {
      case 'hybrid':
        // Schedule both calendar events and notifications
        const calendarResult = await scheduleHybridMedicineReminders(medicine);
        calendarEventIds = calendarResult.calendarEventIds || [];
        // Also schedule backup notifications (implementation needed)
        notificationIds = await scheduleBackupNotifications(medicine);
        break;
        
      case 'calendar-only':
        // Schedule only calendar events
        const calOnlyResult = await scheduleHybridMedicineReminders(medicine);
        calendarEventIds = calOnlyResult.calendarEventIds || [];
        break;
        
      case 'notifications-only':
        // Schedule only notifications (fallback to existing system)
        notificationIds = await scheduleStandardNotifications(medicine);
        console.log('Using notifications-only method (fallback)');
        break;
    }
    
    // Update medicine record with scheduling results
    const updatedMedicine: Partial<Medicine> = {
      calendarEventIds,
      reminderMethod: method,
      lastCalendarSync: new Date(),
      calendarPermissionGranted: systemState.calendarPermission,
    };
    
    await updateMedicine(medicine.medicineId, updatedMedicine);
    
    return {
      success: true,
      calendarEventIds,
      notificationIds,
      method,
    };
  } catch (error) {
    console.error(`❌ Failed to schedule reminders for ${medicine.medicineName}:`, error);
    return {
      success: false,
      method: 'none',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Cancel all reminders for a medicine
export async function cancelMedicineReminders(medicine: Medicine): Promise<boolean> {
  try {
    let success = true;
    
    // Cancel calendar events using the calendar functions (which handle fallback)
    if (medicine.calendarEventIds && medicine.calendarEventIds.length > 0) {
      success = await cancelMedicineCalendarEvents(medicine);
    }
    
    // Cancel standard notifications (if any exist)
    // This would cancel any expo-notifications that were scheduled
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ Cancelled backup notifications');
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
    
    // Update medicine record
    const updatedMedicine: Partial<Medicine> = {
      calendarEventIds: [],
      lastCalendarSync: new Date(),
    };
    
    await updateMedicine(medicine.medicineId, updatedMedicine);
    
    return success;
  } catch (error) {
    console.error(`❌ Failed to cancel reminders for ${medicine.medicineName}:`, error);
    return false;
  }
}

// Perform system maintenance
export async function performSystemMaintenance(): Promise<void> {
  try {
    console.log('🔧 Starting system maintenance...');
    
    if (!systemState.isInitialized) {
      await initializeReminderSystem();
      return;
    }
    
    const user = await account.get();
    const medicineDocuments = await getUserMedicines(true); // activeOnly = true
    const medicines = medicineDocuments.map(doc => doc as unknown as Medicine);
    
    for (const medicine of medicines) {
      if (!medicine.isActive || !medicine.reminderEnabled) {
        // Cancel reminders for inactive medicines
        await cancelMedicineReminders(medicine);
        continue;
      }
      
      // Check if reminders need refresh
      const needsRefresh = !medicine.lastCalendarSync || 
        (Date.now() - medicine.lastCalendarSync.getTime()) > SYSTEM_CONFIG.maintenanceInterval;
      
      if (needsRefresh) {
        console.log(`🔄 Refreshing reminders for ${medicine.medicineName}`);
        await scheduleComprehensiveMedicineReminders(medicine);
      }
    }
    
    // Update maintenance timestamp
    systemState.lastMaintenance = new Date();
    console.log('✅ System maintenance completed');
  } catch (error) {
    console.error('❌ System maintenance failed:', error);
  }
}

// Schedule maintenance to run periodically
let maintenanceInterval: number | null = null;

export function startPeriodicMaintenance(): void {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
  }
  
  maintenanceInterval = setInterval(async () => {
    await performSystemMaintenance();
  }, SYSTEM_CONFIG.maintenanceInterval);
  
  console.log('🔄 Periodic maintenance started');
}

export function stopPeriodicMaintenance(): void {
  if (maintenanceInterval) {
    clearInterval(maintenanceInterval);
    maintenanceInterval = null;
    console.log('⏹️ Periodic maintenance stopped');
  }
}

// Get upcoming medication events from calendar
export async function getUpcomingMedicationReminders(days: number = 7): Promise<any[]> {
  try {
    if (!systemState.calendarPermission) {
      console.warn('No calendar permission for retrieving upcoming events');
      return [];
    }
    
    return await getUpcomingMedicationEvents(days);
  } catch (error) {
    console.error('Failed to get upcoming medication reminders:', error);
    return [];
  }
}

// Health check for the reminder system
export async function performSystemHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'failed';
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check permissions
  if (!systemState.calendarPermission) {
    issues.push('Calendar permissions not granted');
    recommendations.push('Enable calendar permissions for precise medication reminders');
  }
  
  if (!systemState.notificationPermission) {
    issues.push('Notification permissions not granted');
    recommendations.push('Enable notification permissions for backup reminders');
  }
  
  // Check last maintenance
  if (!systemState.lastMaintenance || 
      (Date.now() - systemState.lastMaintenance.getTime()) > SYSTEM_CONFIG.maintenanceInterval * 2) {
    issues.push('System maintenance overdue');
    recommendations.push('Run system maintenance to ensure optimal performance');
  }
  
  // Determine overall status
  let status: 'healthy' | 'degraded' | 'failed';
  if (issues.length === 0) {
    status = 'healthy';
  } else if (systemState.calendarPermission || systemState.notificationPermission) {
    status = 'degraded';
  } else {
    status = 'failed';
  }
  
  return { status, issues, recommendations };
}

// Schedule backup notifications (expo-notifications only)
async function scheduleBackupNotifications(medicine: Medicine): Promise<string[]> {
  try {
    console.log(`📱 Scheduling backup notifications for ${medicine.medicineName}`);
    
    const notificationIds: string[] = [];
    const now = new Date();
    
    // Schedule notifications for the next 7 days (backup coverage)
    for (const timeStr of medicine.times) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      for (let day = 0; day < SYSTEM_CONFIG.maxNotificationDays; day++) {
        const scheduledDate = new Date(now);
        scheduledDate.setDate(now.getDate() + day);
        scheduledDate.setHours(hours, minutes, 0, 0);
        
        // Only schedule if the time is in the future
        if (scheduledDate > now) {
          try {
            const notificationId = await scheduleNotification({
              title: `📋 Backup Reminder: ${medicine.medicineName}`,
              body: `Time to take your ${medicine.dosage} of ${medicine.medicineName}`,
              data: { 
                type: 'medication',
                medicineId: medicine.medicineId,
                scheduledTime: scheduledDate.toISOString(),
                timeSlot: timeStr,
                isBackup: true
              }
            }, {
              type: 'date',
              date: scheduledDate
            });
            
            notificationIds.push(notificationId);
          } catch (error) {
            console.warn(`Failed to schedule backup notification for ${medicine.medicineName} at ${timeStr} on day ${day}:`, error);
          }
        }
      }
    }
    
    console.log(`✅ Scheduled ${notificationIds.length} backup notifications for ${medicine.medicineName}`);
    return notificationIds;
  } catch (error) {
    console.error(`❌ Failed to schedule backup notifications for ${medicine.medicineName}:`, error);
    return [];
  }
}

// Schedule standard notifications (fallback method)
async function scheduleStandardNotifications(medicine: Medicine): Promise<string[]> {
  try {
    console.log(`🔔 Scheduling standard notifications for ${medicine.medicineName}`);
    
    // Use the existing scheduleMedicineReminders function from notifications.ts
    const notificationIds = await scheduleMedicineReminders(medicine);
    
    console.log(`✅ Scheduled ${notificationIds.length} standard notifications for ${medicine.medicineName}`);
    return notificationIds;
  } catch (error) {
    console.error(`❌ Failed to schedule standard notifications for ${medicine.medicineName}:`, error);
    return [];
  }
}

// Helper function to request notification permissions
async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Export system configuration for external use
export { SYSTEM_CONFIG };
