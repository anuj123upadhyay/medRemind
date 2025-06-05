// Calendar-based Medication Reminders with fallback support
// This provides precise timing for medication reminders by leveraging notifications when calendar is unavailable
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medicine } from '../services/collections';

// Safe calendar import with fallback
let Calendar: any = null;
let isCalendarAvailable = false;

try {
  Calendar = require('expo-calendar');
  isCalendarAvailable = true;
  console.log('✅ expo-calendar module loaded successfully');
} catch (error) {
  console.warn('⚠️ expo-calendar not available, using notification-only fallback');
  isCalendarAvailable = false;
}

// Calendar configuration for MedRemind
const MEDREMIND_CALENDAR_NAME = 'MedRemind Medications';
const MEDREMIND_CALENDAR_COLOR = '#FF6B6B'; // Medical red color

// Permission and calendar setup
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    if (!isCalendarAvailable) {
      console.log('📅 Calendar module not available, permissions automatically false');
      return false;
    }
    
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      console.log('✅ Calendar permissions granted');
      return true;
    } else {
      console.log('❌ Calendar permissions denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
}

// Create or get the MedRemind calendar
export async function getOrCreateMedRemindCalendar(): Promise<string | null> {
  try {
    if (!isCalendarAvailable) {
      console.log('📅 Calendar module not available, cannot create calendar');
      return null;
    }
    
    // Get all calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Check if MedRemind calendar already exists
    const existingCalendar = calendars.find((cal: any) => cal.title === MEDREMIND_CALENDAR_NAME);
    
    if (existingCalendar) {
      console.log('✅ Found existing MedRemind calendar:', existingCalendar.id);
      return existingCalendar.id;
    }
    
    // Create new calendar if it doesn't exist
    let calendarSource;
    if (Platform.OS === 'ios') {
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();
      calendarSource = defaultCalendar.source;
    } else {
      calendarSource = {
        isLocalAccount: true,
        name: 'MedRemind Local',
        type: Calendar.SourceType.LOCAL,
      };
    }
    
    const calendarId = await Calendar.createCalendarAsync({
      title: MEDREMIND_CALENDAR_NAME,
      color: MEDREMIND_CALENDAR_COLOR,
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: calendarSource?.id,
      source: calendarSource,
      name: MEDREMIND_CALENDAR_NAME,
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    
    console.log('✅ Created new MedRemind calendar:', calendarId);
    return calendarId;
  } catch (error) {
    console.error('Error creating/getting MedRemind calendar:', error);
    return null;
  }
}

// Fallback function to schedule notifications when calendar is not available
async function scheduleNotificationFallback(medicine: Medicine, daysAhead: number = 7): Promise<string[]> {
  try {
    console.log(`📱 Scheduling notification fallback for ${medicine.medicineName}`);
    
    const notificationIds: string[] = [];
    const now = new Date();
    
    // Limit to 7 days for notifications to avoid overwhelming the user
    const maxDays = Math.min(daysAhead, 7);
    
    for (let day = 0; day < maxDays; day++) {
      for (const timeStr of medicine.times) {
        try {
          const [hours, minutes] = timeStr.split(':').map(Number);
          
          const notificationDate = new Date(now);
          notificationDate.setDate(now.getDate() + day);
          notificationDate.setHours(hours, minutes, 0, 0);
          
          // Skip past times for today
          if (day === 0 && notificationDate < now) {
            continue;
          }
          
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `💊 ${medicine.medicineName}`,
              body: `Time to take ${medicine.dosage} of ${medicine.medicineName}`,
              data: {
                type: 'medication',
                medicineId: medicine.medicineId,
                medicineName: medicine.medicineName,
                isCalendarFallback: true,
              },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notificationDate,
            },
          });
          
          notificationIds.push(notificationId);
          console.log(`✅ Scheduled fallback notification for ${medicine.medicineName} at ${notificationDate.toLocaleString()}`);
        } catch (error) {
          console.error(`Error scheduling fallback notification for ${medicine.medicineName}:`, error);
        }
      }
    }
    
    console.log(`✅ Scheduled ${notificationIds.length} fallback notifications for ${medicine.medicineName}`);
    return notificationIds;
  } catch (error) {
    console.error('Error scheduling notification fallback:', error);
    return [];
  }
}

// Schedule medication reminder events in calendar (with fallback)
export async function scheduleMedicineCalendarEvents(
  medicine: Medicine,
  daysAhead: number = 30
): Promise<string[]> {
  try {
    if (!isCalendarAvailable) {
      console.log('📅 Calendar not available, scheduling notifications instead');
      return await scheduleNotificationFallback(medicine, daysAhead);
    }
    
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      console.log('❌ Calendar permissions not granted, falling back to notifications');
      return await scheduleNotificationFallback(medicine, daysAhead);
    }
    
    const calendarId = await getOrCreateMedRemindCalendar();
    if (!calendarId) {
      console.log('❌ Could not get/create calendar, falling back to notifications');
      return await scheduleNotificationFallback(medicine, daysAhead);
    }
    
    const eventIds: string[] = [];
    const now = new Date();
    
    // Schedule events for each reminder time for the next N days
    for (let day = 0; day < daysAhead; day++) {
      for (const timeStr of medicine.times) {
        try {
          const [hours, minutes] = timeStr.split(':').map(Number);
          
          // Create event date
          const eventDate = new Date(now);
          eventDate.setDate(now.getDate() + day);
          eventDate.setHours(hours, minutes, 0, 0);
          
          // Skip past times for today
          if (day === 0 && eventDate < now) {
            continue;
          }
          
          // Create event end time (15 minutes later)
          const endDate = new Date(eventDate);
          endDate.setMinutes(endDate.getMinutes() + 15);
          
          const eventId = await Calendar.createEventAsync(calendarId, {
            title: `💊 ${medicine.medicineName}`,
            startDate: eventDate,
            endDate: endDate,
            notes: `Take ${medicine.dosage} of ${medicine.medicineName}\n\nMedication reminder from MedRemind app.`,
            alarms: [
              { relativeOffset: 0 }, // Exactly at the time
              { relativeOffset: -5 }, // 5 minutes before
            ],
            availability: Calendar.Availability.FREE,
            timeZone: 'default',
          });
          
          eventIds.push(eventId);
          console.log(`✅ Created calendar event for ${medicine.medicineName} at ${eventDate.toLocaleString()}`);
        } catch (error) {
          console.error(`Error creating calendar event for ${medicine.medicineName}:`, error);
        }
      }
    }
    
    console.log(`✅ Created ${eventIds.length} calendar events for ${medicine.medicineName}`);
    return eventIds;
  } catch (error) {
    console.error('Error scheduling medicine calendar events:', error);
    return await scheduleNotificationFallback(medicine, daysAhead);
  }
}

// Cancel all calendar events for a specific medicine (with fallback)
export async function cancelMedicineCalendarEvents(medicine: Medicine): Promise<boolean> {
  try {
    let success = true;
    
    if (!isCalendarAvailable) {
      console.log('📅 Calendar not available, cancelling notifications instead');
      // Cancel notification as fallback since calendar is not available
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        const data = notification.content.data as { medicineId?: string } | null;
        if (data?.medicineId === medicine.medicineId) {
          try {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          } catch (error) {
            console.error(`Error canceling notification ${notification.identifier}:`, error);
          }
        }
      }
      return true;
    }
    
    const calendarId = await getOrCreateMedRemindCalendar();
    if (!calendarId) {
      console.log('❌ Could not get calendar, cancelling notifications as fallback');
      // Cancel notifications as fallback
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        const data = notification.content.data as { medicineId?: string } | null;
        if (data?.medicineId === medicine.medicineId) {
          try {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          } catch (error) {
            console.error(`Error canceling notification ${notification.identifier}:`, error);
          }
        }
      }
      return true;
    }
    
    // Get future events from the calendar
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days ahead
    
    try {
      const events = await Calendar.getEventsAsync([calendarId], now, futureDate);
      
      // Filter events for this specific medicine
      const medicineEvents = events.filter((event: any) => 
        event.title?.includes(medicine.medicineName) || 
        event.notes?.includes(medicine.medicineName)
      );
      
      console.log(`Found ${medicineEvents.length} calendar events for ${medicine.medicineName}`);
      
      // Delete each event with individual error handling
      let deletedCount = 0;
      for (const event of medicineEvents) {
        try {
          await Calendar.deleteEventAsync(event.id);
          deletedCount++;
          console.log(`✅ Deleted calendar event: ${event.title}`);
        } catch (deleteError) {
          console.error(`❌ Error deleting calendar event ${event.id} (${event.title}):`, deleteError);
          success = false;
          // Continue with other events even if one fails
        }
      }
      
      console.log(`✅ Successfully deleted ${deletedCount}/${medicineEvents.length} calendar events for ${medicine.medicineName}`);
      return success;
    } catch (getEventsError) {
      console.error('❌ Error getting calendar events:', getEventsError);
      
      // If we can't get events, try to cancel notifications as fallback
      console.log('🔄 Falling back to canceling notifications...');
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        const data = notification.content.data as { medicineId?: string } | null;
        if (data?.medicineId === medicine.medicineId) {
          try {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          } catch (error) {
            console.error(`Error canceling notification ${notification.identifier}:`, error);
          }
        }
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Critical error in cancelMedicineCalendarEvents:', error);
    
    // Final fallback - cancel all related notifications
    try {
      console.log('🔄 Final fallback: canceling notifications for medicine...');
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        const data = notification.content.data as { medicineId?: string } | null;
        if (data?.medicineId === medicine.medicineId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
      console.log('✅ Fallback notification cancellation completed');
    } catch (fallbackError) {
      console.error('❌ Even fallback notification cancellation failed:', fallbackError);
    }
    
    return false;
  }
}

// Hybrid approach: Calendar events + backup notifications (with fallback)
export async function scheduleHybridMedicineReminders(
  medicine: Medicine,
  options: {
    useCalendar?: boolean;
    useNotifications?: boolean;
    daysAhead?: number;
  } = {}
): Promise<{
  calendarEventIds: string[];
  notificationIds: string[];
  method: 'hybrid' | 'calendar-only' | 'notifications-only';
}> {
  const {
    useCalendar = true,
    useNotifications = true,
    daysAhead = 30,
  } = options;
  
  const result = {
    calendarEventIds: [] as string[],
    notificationIds: [] as string[],
    method: 'notifications-only' as 'hybrid' | 'calendar-only' | 'notifications-only',
  };
  
  try {
    // Try calendar first (most reliable) if available
    if (useCalendar && isCalendarAvailable) {
      const calendarEventIds = await scheduleMedicineCalendarEvents(medicine, daysAhead);
      result.calendarEventIds = calendarEventIds;
      
      if (calendarEventIds.length > 0) {
        result.method = useNotifications ? 'hybrid' : 'calendar-only';
        console.log(`✅ Calendar reminders scheduled for ${medicine.medicineName}`);
      }
    }
    
    // Add backup notifications if requested or if calendar failed
    if (useNotifications && (result.calendarEventIds.length === 0 || useCalendar)) {
      console.log('📱 Adding backup notifications for extra reliability');
      
      // Schedule notifications for the next few days as backup
      const notificationIds: string[] = [];
      const now = new Date();
      
      for (let day = 0; day < Math.min(daysAhead, 7); day++) { // Max 7 days of notifications as backup
        for (const timeStr of medicine.times) {
          try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            
            const notificationDate = new Date(now);
            notificationDate.setDate(now.getDate() + day);
            notificationDate.setHours(hours, minutes, 0, 0);
            
            // Skip past times for today
            if (day === 0 && notificationDate < now) {
              continue;
            }
            
            const notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: `💊 Medicine Reminder`,
                body: `Time to take ${medicine.dosage} of ${medicine.medicineName}`,
                data: {
                  type: 'medication',
                  medicineId: medicine.medicineId,
                  medicineName: medicine.medicineName,
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: notificationDate,
              },
            });
            
            notificationIds.push(notificationId);
          } catch (error) {
            console.error(`Error scheduling backup notification for ${medicine.medicineName}:`, error);
          }
        }
      }
      
      result.notificationIds = notificationIds;
      if (result.calendarEventIds.length === 0) {
        result.method = 'notifications-only';
      }
    }
    
    console.log(`✅ Hybrid reminders scheduled for ${medicine.medicineName}:`, {
      calendar: result.calendarEventIds.length,
      notifications: result.notificationIds.length,
      method: result.method,
    });
    
    return result;
  } catch (error) {
    console.error('Error scheduling hybrid medicine reminders:', error);
    return result;
  }
}

// Get upcoming medication events from calendar (with fallback)
export async function getUpcomingMedicationEvents(daysAhead: number = 7): Promise<any[]> {
  try {
    if (!isCalendarAvailable) {
      console.log('📅 Calendar not available, cannot retrieve events');
      return [];
    }
    
    const calendarId = await getOrCreateMedRemindCalendar();
    if (!calendarId) return [];
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
    
    const events = await Calendar.getEventsAsync([calendarId], now, futureDate);
    
    return events.map((event: any) => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      notes: event.notes,
      medicine: event.title?.replace('💊 ', '') || 'Unknown Medicine',
    }));
  } catch (error) {
    console.error('Error getting upcoming medication events:', error);
    return [];
  }
}

// Maintain calendar events (clean old ones, add new ones) (with fallback)
export async function maintainCalendarEvents(): Promise<void> {
  try {
    if (!isCalendarAvailable) {
      console.log('📅 Calendar not available, skipping maintenance');
      return;
    }
    
    const calendarId = await getOrCreateMedRemindCalendar();
    if (!calendarId) return;
    
    // Clean up old events (older than 1 day)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const oldEvents = await Calendar.getEventsAsync([calendarId], oneMonthAgo, yesterday);
    
    for (const event of oldEvents) {
      try {
        await Calendar.deleteEventAsync(event.id);
        console.log(`🗑️ Cleaned up old calendar event: ${event.title}`);
      } catch (error) {
        console.error(`Error cleaning up old event ${event.id}:`, error);
      }
    }
    
    console.log(`✅ Calendar maintenance completed - cleaned ${oldEvents.length} old events`);
  } catch (error) {
    console.error('Error maintaining calendar events:', error);
  }
}
