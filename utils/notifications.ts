// Notifications utility for MedRemind with Appwrite integration
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Medicine, Reminder } from '../services/collections';
import { usersCollection, account } from '../services/appwrite';
import { getUserMedicines } from '../services/medicationService';
import { getReminderHistory, recordDoseTaken as recordDose, recordDoseMissed } from '../services/doseHistoryService';
import {
  scheduleHybridMedicineReminders,
  cancelMedicineCalendarEvents,
  maintainCalendarEvents,
  getUpcomingMedicationEvents,
  requestCalendarPermissions
} from './calendarNotifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Register for push notifications and store token in user profile
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;
  
  // Check if device is a physical device (not an emulator/simulator)
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return null;
  }
  
  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  // Get token
  try {
    const response = await Notifications.getExpoPushTokenAsync();
    token = response.data;
    
    // Set up Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    // Save token to user profile in Appwrite
    try {
      const currentUser = await account.get();
      await usersCollection.update(currentUser.$id, {
        expoPushToken: token
      });
    } catch (error) {
      console.error('Failed to save push token to user profile:', error);
    }
    
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Schedule a single notification
export async function scheduleNotification(
  content: { 
    title: string; 
    body: string; 
    data?: Record<string, unknown> 
  },
  trigger?: any
): Promise<string> {
  const notificationRequest: any = { content };
  
  // Handle trigger: if undefined, set to null for immediate notification
  // If defined and not null, use the provided trigger
  if (trigger !== undefined) {
    notificationRequest.trigger = trigger;
  } else {
    // For immediate notifications, explicitly pass null
    notificationRequest.trigger = null;
  }
  
  return await Notifications.scheduleNotificationAsync(notificationRequest);
}

// Schedule multiple notifications
export async function scheduleNotifications(
  notifications: Array<{ 
    title: string; 
    body: string; 
    data?: Record<string, unknown>;
    trigger?: any;
  }>
): Promise<string[]> {
  const notificationIds = [];
  
  for (const notification of notifications) {
    try {
      const id = await scheduleNotification(
        { 
          title: notification.title, 
          body: notification.body, 
          data: notification.data 
        },
        notification.trigger
      );
      notificationIds.push(id);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }
  
  return notificationIds;
}

// Schedule medication reminders based on medicine data
export async function scheduleMedicineReminders(medicine: Medicine): Promise<string[]> {
  if (!medicine.reminderEnabled) return [];
  
  try {
    const notificationIds: string[] = [];
    const now = new Date();
    
    // Schedule notifications for each time, for multiple days
    for (const timeStr of medicine.times) {
      // Parse the time string (format: "HH:MM")
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Schedule for the next 30 days (or duration of treatment)
      const daysToSchedule = medicine.duration || 30;
      
      for (let day = 0; day < daysToSchedule; day++) {
        const scheduledDate = new Date(now);
        scheduledDate.setDate(now.getDate() + day);
        scheduledDate.setHours(hours, minutes, 0, 0);
        
        // Only schedule if the time is in the future
        if (scheduledDate > now) {
          try {
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `Medicine Reminder: ${medicine.medicineName}`,
                body: `Time to take your ${medicine.dosage} of ${medicine.medicineName}`,
                data: { 
                  type: 'medication', 
                  medicineId: medicine.medicineId,
                  scheduledTime: scheduledDate.toISOString(),
                  timeSlot: timeStr
                }
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: scheduledDate
              }
            });
            
            notificationIds.push(notificationId);
          } catch (error) {
            console.error(`Error scheduling notification for ${medicine.medicineName} at ${timeStr} on day ${day}:`, error);
          }
        }
      }
    }
    
    return notificationIds;
  } catch (error) {
    console.error('Error scheduling medicine reminders:', error);
    return [];
  }
}

// Schedule refill reminder if medicine is low
export async function scheduleRefillReminder(medicine: Medicine): Promise<string | null> {
  // Check if refill reminders are enabled for this medicine
  if (!medicine.refillReminder) {
    console.log(`⏭️ Refill reminders disabled for ${medicine.medicineName}`);
    return null;
  }
  
  // Check if we have the necessary supply information
  if (!medicine.currentSupply || !medicine.refillAt || !medicine.totalSupply) {
    console.log(`⏭️ Missing supply information for ${medicine.medicineName}: currentSupply=${medicine.currentSupply}, refillAt=${medicine.refillAt}, totalSupply=${medicine.totalSupply}`);
    return null;
  }
  
  // Calculate the refill threshold based on percentage of total supply
  const refillThresholdCount = Math.ceil((medicine.refillAt / 100) * medicine.totalSupply);
  
  console.log(`🧮 Refill calculation for ${medicine.medicineName}:`);
  console.log(`   - Total supply: ${medicine.totalSupply}`);
  console.log(`   - Refill threshold: ${medicine.refillAt}% = ${refillThresholdCount} doses`);
  console.log(`   - Current supply: ${medicine.currentSupply}`);
  console.log(`   - Should trigger: ${medicine.currentSupply <= refillThresholdCount}`);
  
  // Only schedule refill reminder if current supply is at or below refill threshold
  if (medicine.currentSupply <= refillThresholdCount) {
    try {
      const daysLeft = Math.floor(medicine.currentSupply / (medicine.times.length || 1));
      const isUrgent = daysLeft <= 2;
      const percentageLeft = Math.round((medicine.currentSupply / medicine.totalSupply) * 100);
      
      const notificationId = await scheduleNotification({
        title: isUrgent ? `🚨 URGENT: Refill ${medicine.medicineName}` : `💊 Refill Reminder: ${medicine.medicineName}`,
        body: `Your supply is running low. You have ${medicine.currentSupply} doses left (${percentageLeft}% remaining, ≈${daysLeft} days).`,
        data: { 
          type: 'refill', 
          medicineId: medicine.medicineId,
          currentSupply: medicine.currentSupply,
          refillAt: medicine.refillAt,
          refillThresholdCount: refillThresholdCount,
          daysLeft: daysLeft
        }
      });
      
      console.log(`🔔 Scheduled ${isUrgent ? 'URGENT' : 'regular'} refill reminder for ${medicine.medicineName}: ${medicine.currentSupply} ≤ ${refillThresholdCount} (${medicine.refillAt}% threshold, ${daysLeft} days left)`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling refill reminder:', error);
      return null;
    }
  } else {
    console.log(`⏭️ Skipping refill reminder for ${medicine.medicineName}: supply ${medicine.currentSupply} > threshold ${refillThresholdCount} (${medicine.refillAt}%)`);
    return null;
  }
}

// Cancel all notifications for a medicine
export async function cancelMedicineNotifications(medicineId: string): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as { medicineId?: string } | null;
      
      if (data?.medicineId === medicineId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

// Add a notification listener to handle notification responses
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Cancel a specific notification by ID
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

// Get all scheduled notifications
export async function getAllScheduledNotifications(): Promise<any[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Complete medicine management - schedule all reminders for a medicine using hybrid approach
export async function scheduleCompleteMedicineManagement(
  medicine: Medicine,
  options: {
    forceReschedule?: boolean;
    includeRefillReminders?: boolean;
    validateTimes?: boolean;
    useCalendar?: boolean;
    daysAhead?: number;
  } = {}
): Promise<{
  medicineReminderIds: string[];
  calendarEventIds: string[];
  refillReminderId: string | null;
  method: 'hybrid' | 'calendar-only' | 'notifications-only';
  schedulingSummary: {
    scheduledDays: number;
    dailyDoses: number;
    treatmentDuration: number;
    supplyManagement: {
      daysOfSupplyLeft: number;
      refillThreshold: number;
    };
  };
}> {
  try {
    const { 
      forceReschedule = false, 
      includeRefillReminders = true,
      useCalendar = true,
      daysAhead = 30
    } = options;

    // Cancel existing notifications and calendar events if force reschedule
    if (forceReschedule) {
      await cancelMedicineNotifications(medicine.medicineId);
      await cancelMedicineCalendarEvents(medicine);
    }

    // Use hybrid approach for medicine reminders (calendar + notifications)
    const hybridResult = await scheduleHybridMedicineReminders(medicine, {
      useCalendar,
      useNotifications: true, // Always use notifications as backup
      daysAhead,
    });
    
    // Schedule refill reminder if needed (using regular notifications)
    let refillReminderId: string | null = null;
    if (includeRefillReminders && medicine.refillReminder) {
      refillReminderId = await scheduleRefillReminder(medicine);
    }

    // Calculate scheduling summary
    const dailyDoses = medicine.times.length;
    const treatmentDuration = medicine.duration || 0;
    const scheduledDays = Math.min(daysAhead, treatmentDuration || daysAhead);
    const daysOfSupplyLeft = medicine.currentSupply ? 
      Math.floor(medicine.currentSupply / dailyDoses) : 0;

    const result = {
      medicineReminderIds: hybridResult.notificationIds,
      calendarEventIds: hybridResult.calendarEventIds,
      refillReminderId,
      method: hybridResult.method,
      schedulingSummary: {
        scheduledDays,
        dailyDoses,
        treatmentDuration,
        supplyManagement: {
          daysOfSupplyLeft,
          refillThreshold: medicine.refillAt || 0,
        },
      },
    };

    console.log(`✅ Complete medicine management scheduled for ${medicine.medicineName}:`, {
      method: result.method,
      calendarEvents: result.calendarEventIds.length,
      notifications: result.medicineReminderIds.length,
      refillReminder: !!result.refillReminderId,
    });

    return result;
  } catch (error) {
    console.error('Error in complete medicine management:', error);
    return {
      medicineReminderIds: [],
      calendarEventIds: [],
      refillReminderId: null,
      method: 'notifications-only',
      schedulingSummary: {
        scheduledDays: 0,
        dailyDoses: 0,
        treatmentDuration: 0,
        supplyManagement: {
          daysOfSupplyLeft: 0,
          refillThreshold: 0,
        },
      },
    };
  }
}

// Sync local notifications with remote Appwrite data
export async function syncNotificationsWithAppwrite(userId: string): Promise<void> {
  try {
    console.log('🔄 Starting syncNotificationsWithAppwrite...');
    
    // 1. Get all active medications from Appwrite
    const medicines = await getUserMedicines(true); // Only active medicines
    console.log(`📋 Found ${medicines.length} active medicines`);
    
    // 2. Clear all existing notifications
    await cancelAllNotifications();
    console.log('🗑️ Cleared all existing notifications');
    
    // 3. Re-schedule notifications for all active medicines
    for (const medicine of medicines) {
      const medicineData = medicine as unknown as Medicine;
      console.log(`\n🔄 Processing ${medicineData.medicineName}:`);
      console.log(`   - Reminder enabled: ${medicineData.reminderEnabled}`);
      console.log(`   - Refill reminder enabled: ${medicineData.refillReminder}`);
      console.log(`   - Current supply: ${medicineData.currentSupply}`);
      console.log(`   - Refill threshold: ${medicineData.refillAt}`);
      
      if (medicineData.reminderEnabled) {
        await scheduleMedicineReminders(medicineData);
        console.log(`   ✅ Scheduled medicine reminders`);
      }
      
      // Only schedule refill reminders if current supply is at or below the refill threshold (percentage-based)
      if (medicineData.refillReminder && 
          medicineData.currentSupply !== undefined && 
          medicineData.refillAt !== undefined &&
          medicineData.totalSupply !== undefined) {
        
        const refillThresholdCount = Math.ceil((medicineData.refillAt / 100) * medicineData.totalSupply);
        const shouldTriggerRefill = medicineData.currentSupply <= refillThresholdCount;
        
        console.log(`   - Refill calculation: ${medicineData.refillAt}% of ${medicineData.totalSupply} = ${refillThresholdCount} doses threshold`);
        console.log(`   - Should trigger refill: ${medicineData.currentSupply} <= ${refillThresholdCount} = ${shouldTriggerRefill}`);
        
        if (shouldTriggerRefill) {
          console.log(`   🔔 SCHEDULING REFILL REMINDER: ${medicineData.currentSupply} <= ${refillThresholdCount} (${medicineData.refillAt}%)`);
          await scheduleRefillReminder(medicineData);
        } else {
          console.log(`   ⏭️ SKIPPING REFILL REMINDER: ${medicineData.currentSupply} > ${refillThresholdCount} (not at ${medicineData.refillAt}% threshold)`);
        }
      } else if (medicineData.refillReminder) {
        console.log(`   ⏭️ MISSING DATA for refill calculation: currentSupply=${medicineData.currentSupply}, refillAt=${medicineData.refillAt}, totalSupply=${medicineData.totalSupply}`);
      }
    }
    
    console.log('✅ Successfully synced notifications with Appwrite data');
  } catch (error) {
    console.error('❌ Error syncing notifications:', error);
  }
}

// Mark a notification as handled in Appwrite
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse
): Promise<void> {
  try {
    const data = response.notification.request.content.data as { 
      type?: string; 
      medicineId?: string;
      reminderId?: string;
    } | undefined;
    
    if (!data) return;
    
    switch (data.type) {
      case 'medication':
        if (data.reminderId) {
          await recordDose(data.reminderId);
          console.log('Recorded dose as taken for reminder:', data.reminderId);
        }
        break;
        
      case 'refill':
        if (data.medicineId) {
          // Navigate to refill screen would be handled in the app component
          console.log('Handle refill for medicine:', data.medicineId);
        }
        break;
        
      default:
        console.log('Unknown notification type:', data.type);
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
}

// Check for missed notifications on app startup
export async function checkMissedNotifications(userId: string): Promise<void> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    
    // Get today's reminders
    const todayReminders = await getReminderHistory(userId, today, now);
    
    // Find reminders that are in the past but still have "pending" status
    const missedReminders = todayReminders.filter((reminder: any) => {
      const reminderTime = new Date(reminder.scheduledTime);
      return (
        reminder.status === 'pending' && 
        reminderTime < now &&
        // Only consider it missed if more than 30 minutes have passed
        (now.getTime() - reminderTime.getTime()) > 30 * 60 * 1000
      );
    });
    
    // Mark each missed reminder
    for (const reminder of missedReminders) {
      await recordDoseMissed(reminder.reminderId);
      console.log('Marked missed dose for reminder:', reminder.reminderId);
    }
    
    if (missedReminders.length > 0) {
      console.log(`Processed ${missedReminders.length} missed notifications`);
    }
  } catch (error) {
    console.error('Error checking missed notifications:', error);
  }
}

// Update notification after medication change
export async function updateMedicineNotifications(medicine: Medicine): Promise<void> {
  try {
    // 1. Cancel existing notifications for this medicine
    await cancelMedicineNotifications(medicine.medicineId);
    
    // 2. If reminders are enabled, schedule new ones
    if (medicine.reminderEnabled && medicine.isActive) {
      await scheduleMedicineReminders(medicine);
    }
    
    // 3. Check if refill reminder is needed (only if supply is at/below threshold based on percentage)
    if (medicine.refillReminder && 
        medicine.isActive && 
        medicine.currentSupply !== undefined && 
        medicine.refillAt !== undefined &&
        medicine.totalSupply !== undefined) {
      
      const refillThresholdCount = Math.ceil((medicine.refillAt / 100) * medicine.totalSupply);
      if (medicine.currentSupply <= refillThresholdCount) {
        await scheduleRefillReminder(medicine);
      }
    }
  } catch (error) {
    console.error('Error updating medicine notifications:', error);
  }
}

// Debug function to show all scheduled notifications
export async function debugScheduledNotifications(): Promise<void> {
  console.log('🔍 DEBUG: Current scheduled notifications');
  console.log('==========================================');
  
  const scheduled = await getAllScheduledNotifications();
  
  if (scheduled.length === 0) {
    console.log('No notifications currently scheduled.');
    return;
  }
  
  scheduled.forEach((notification: any, index: number) => {
    const data = notification.content?.data || {};
    const triggerTime = notification.trigger?.timestamp || 0;
    const now = Date.now();
    const minutesUntil = Math.round((triggerTime - now) / 60000);
    
    console.log(`\n${index + 1}. ${notification.content?.title || 'Unknown'}`);
    console.log(`   ID: ${notification.identifier}`);
    console.log(`   Medicine: ${data.medicineName || 'N/A'}`);
    console.log(`   Type: ${data.type || 'N/A'}`);
    console.log(`   Scheduled: ${new Date(triggerTime).toLocaleString()}`);
    console.log(`   Minutes until: ${minutesUntil > 0 ? minutesUntil : 'OVERDUE'}`);
    console.log(`   Data:`, data);
  });
  
  console.log(`\nTotal: ${scheduled.length} notifications scheduled`);
}

// Reschedule notifications to maintain continuous reminders
export async function maintainContinuousReminders(): Promise<void> {
  try {
    console.log('🔄 Maintaining continuous reminders...');
    
    // Maintain calendar events (clean old, ensure future ones exist)
    await maintainCalendarEvents();
    
    // Get all active medicines
    const activeMedicines = await getUserMedicines(true);
    
    // Get currently scheduled notifications
    const scheduledNotifications = await getAllScheduledNotifications();
    
    for (const medicine of activeMedicines) {
      const medicineData = medicine as unknown as Medicine;
      
      if (!medicineData.reminderEnabled || !medicineData.isActive) continue;
      
      // Count how many future notifications exist for this medicine
      const futureNotifications = scheduledNotifications.filter(notification => {
        const data = notification.content.data as { medicineId?: string } | null;
        const triggerTime = notification.trigger?.date ? new Date(notification.trigger.date).getTime() : 0;
        const now = Date.now();
        
        return data?.medicineId === medicineData.medicineId && triggerTime > now;
      });
      
      // If less than 7 days of notifications remaining, schedule more
      const futureNotificationCount = futureNotifications.length;
      const expectedDailyNotifications = medicineData.times.length;
      const daysOfNotificationsRemaining = Math.floor(futureNotificationCount / expectedDailyNotifications);
      
      if (daysOfNotificationsRemaining < 7) {
        console.log(`Rescheduling reminders for ${medicineData.medicineName} (only ${daysOfNotificationsRemaining} days remaining)`);
        
        // Use hybrid approach to reschedule both calendar and notifications
        // Don't include refill reminders in maintenance - only schedule them when dose is taken
        await scheduleCompleteMedicineManagement(medicineData, {
          forceReschedule: true,
          useCalendar: true,
          daysAhead: 30,
          includeRefillReminders: false, // Don't auto-schedule refill reminders during maintenance
        });
      }
    }
    
    console.log('✅ Continuous reminders maintenance completed');
  } catch (error) {
    console.error('Error maintaining continuous reminders:', error);
  }
}

// Export calendar-based notification functions for external use
export {
  requestCalendarPermissions,
  getUpcomingMedicationEvents,
  scheduleHybridMedicineReminders,
  cancelMedicineCalendarEvents,
  maintainCalendarEvents
} from './calendarNotifications';