// filepath: /Users/anujupadhyay/Desktop/medremind 3/medRemind/utils/notifications.ts
// Notifications utility for MedRemind with Appwrite integration
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Medicine, Reminder } from '../services/collections';
import { usersCollection, account } from '../services/appwrite';
import { getUserMedicines } from '../services/medicationService';
import { getReminderHistory, recordDoseTaken as recordDose, recordDoseMissed } from '../services/doseHistoryService';

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
    const reminderNotifications = medicine.times.map(timeStr => {
      // Parse the time string (format: "HH:MM")
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      return {
        title: `Medicine Reminder: ${medicine.medicineName}`,
        body: `Time to take your ${medicine.dosage} of ${medicine.medicineName}`,
        data: { 
          type: 'medication', 
          medicineId: medicine.medicineId 
        },
        trigger: { 
          hour: hours,
          minute: minutes,
          repeats: true
        }
      };
    });
    
    return await scheduleNotifications(reminderNotifications);
  } catch (error) {
    console.error('Error scheduling medicine reminders:', error);
    return [];
  }
}

// Schedule refill reminder if medicine is low
export async function scheduleRefillReminder(medicine: Medicine): Promise<string | null> {
  if (!medicine.refillReminder || !medicine.currentSupply || !medicine.refillAt) {
    return null;
  }
  
  // Calculate actual refill threshold count from percentage
  const refillThresholdCount = Math.ceil((medicine.refillAt / 100) * (medicine.totalSupply || 1));
  
  console.log(`🧮 Refill calculation for ${medicine.medicineName}:`);
  console.log(`   - Total supply: ${medicine.totalSupply}`);
  console.log(`   - Current supply: ${medicine.currentSupply}`);
  console.log(`   - Refill threshold: ${medicine.refillAt}% = ${refillThresholdCount} doses`);
  console.log(`   - Should schedule refill: ${medicine.currentSupply <= refillThresholdCount}`);
  
  // Check if current supply is at or below refill threshold
  if (medicine.currentSupply <= refillThresholdCount) {
    try {
      return await scheduleNotification({
        title: `Refill Reminder: ${medicine.medicineName}`,
        body: `Your supply of ${medicine.medicineName} is running low. You have ${medicine.currentSupply} doses left.`,
        data: { 
          type: 'refill', 
          medicineId: medicine.medicineId 
        }
      });
    } catch (error) {
      console.error('Error scheduling refill reminder:', error);
      return null;
    }
  }
  
  return null;
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

// Sync local notifications with remote Appwrite data
export async function syncNotificationsWithAppwrite(userId: string): Promise<void> {
  try {
    // 1. Get all active medications from Appwrite
    const medicines = await getUserMedicines(true); // Only active medicines
    
    // 2. Clear all existing notifications
    await cancelAllNotifications();
    
    // 3. Re-schedule notifications for all active medicines
    for (const medicine of medicines) {
      const medicineData = medicine as unknown as Medicine;
      if (medicineData.reminderEnabled) {
        await scheduleMedicineReminders(medicineData);
      }
      
      // Only schedule refill reminders if current supply is at or below the refill threshold
      if (medicineData.refillReminder && 
          medicineData.currentSupply !== undefined && 
          medicineData.refillAt !== undefined) {
        
        // Calculate actual refill threshold count from percentage
        const refillThresholdCount = Math.ceil((medicineData.refillAt / 100) * (medicineData.totalSupply || 1));
        const shouldTriggerRefill = medicineData.currentSupply <= refillThresholdCount;
        
        console.log(`🔄 Sync check for ${medicineData.medicineName}: ${medicineData.currentSupply} <= ${refillThresholdCount} (${medicineData.refillAt}%) = ${shouldTriggerRefill}`);
        
        if (shouldTriggerRefill) {
          await scheduleRefillReminder(medicineData);
        }
      }
    }
    
    console.log('Successfully synced notifications with Appwrite data');
  } catch (error) {
    console.error('Error syncing notifications:', error);
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
    
    // 3. Check if refill reminder is needed (only if supply is at/below threshold)
    if (medicine.refillReminder && 
        medicine.isActive && 
        medicine.currentSupply !== undefined && 
        medicine.refillAt !== undefined) {
      
      // Calculate actual refill threshold count from percentage
      const refillThresholdCount = Math.ceil((medicine.refillAt / 100) * (medicine.totalSupply || 1));
      const shouldTriggerRefill = medicine.currentSupply <= refillThresholdCount;
      
      console.log(`🔄 Update check for ${medicine.medicineName}: ${medicine.currentSupply} <= ${refillThresholdCount} (${medicine.refillAt}%) = ${shouldTriggerRefill}`);
      
      if (shouldTriggerRefill) {
        await scheduleRefillReminder(medicine);
      }
    }
  } catch (error) {
    console.error('Error updating medicine notifications:', error);
  }
}
