// Dose history service for tracking medication consumption
import { ID, Query } from 'react-native-appwrite';
import { remindersCollection, adherenceCollection, account } from './appwrite';
import { updateMedicineSupply } from './medicationService';

// Find the appropriate reminder for a medicine at a specific time
export const findReminderForMedicineAndTime = async (
  medicineId: string,
  userId: string,
  scheduledTime: Date
): Promise<string | null> => {
  try {
    console.log('Finding reminder for:', { medicineId, userId, scheduledTime: scheduledTime.toISOString() });
    
    // Create a time range around the scheduled time (within 1 hour)
    const start = new Date(scheduledTime);
    start.setMinutes(start.getMinutes() - 30); // 30 minutes before
    
    const end = new Date(scheduledTime);
    end.setMinutes(end.getMinutes() + 30); // 30 minutes after
    
    console.log('Search range:', { start: start.toISOString(), end: end.toISOString() });
    
    // Query for reminders that match medicine, user, and are within the time range
    const reminders = await remindersCollection.list([
      Query.equal('medicineId', medicineId),
      Query.equal('userId', userId),
      Query.greaterThanEqual('scheduledTime', start.toISOString()),
      Query.lessThanEqual('scheduledTime', end.toISOString())
    ]);
    
    console.log('Found reminders:', reminders.documents.length);
    
    if (reminders.documents.length > 0) {
      // Find any reminder that's not already taken
      const availableReminder = reminders.documents.find(r => r.status !== 'taken');
      
      if (availableReminder) {
        console.log('Using existing available reminder:', availableReminder.$id);
        return availableReminder.$id;
      }
      
      // If all reminders are taken, return the most recent one
      const latestReminder = reminders.documents.reduce((latest, current) => {
        return new Date(current.$updatedAt) > new Date(latest.$updatedAt) ? current : latest;
      });
      
      console.log('Using most recent reminder (already taken):', latestReminder.$id);
      return latestReminder.$id;
    }
    
    // Only create a new reminder if the scheduled time is for today or future
    const today = new Date();
    const scheduledDate = new Date(scheduledTime);
    
    // Don't create reminders for past dates (more than 1 day old)
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    if (scheduledDate < oneDayAgo) {
      console.log('Not creating reminder for old date:', scheduledDate.toISOString());
      return null;
    }
    
    // If no existing reminder found and date is valid, create one
    console.log('Creating new reminder for valid date...');
    
    const reminderData: any = {
      reminderId: ID.unique(),
      medicineId,
      userId,
      scheduledTime: scheduledTime.toISOString(),
      status: 'pending',
      snoozeCount: 0
    };
    
    console.log(`Creating reminder with scheduled time:`, scheduledTime.toISOString());
    
    const newReminder = await remindersCollection.create(reminderData);
    
    console.log('Created new reminder:', newReminder.$id);
    return newReminder.$id;
  } catch (error) {
    console.error('Error finding reminder for medicine and time:', error);
    return null;
  }
};

// Record a medication dose as taken
export const recordDoseTaken = async (reminderId: string) => {
  try {
    let reminderDoc;
    let documentId = reminderId;
    
    // First try to get the reminder by document ID
    try {
      reminderDoc = await remindersCollection.get(reminderId);
    } catch (error) {
      // If that fails, try to find by reminderId field
      reminderDoc = await remindersCollection.findByReminderId(reminderId);
      
      if (reminderDoc) {
        documentId = reminderDoc.$id; // Use the document ID for updates
      } else {
        throw new Error(`Reminder with ID ${reminderId} not found. The reminder may have been deleted or doesn't exist.`);
      }
    }
    
    // Update reminder status using the correct document ID
    const updatedReminder = await remindersCollection.updateStatus(
      documentId,
      'taken',
      new Date()
    );
    
    // Update medicine supply and adherence data
    await updateMedicineSupply(reminderDoc.medicineId, -1);
    await updateAdherenceData(reminderDoc.medicineId, reminderDoc.userId, true);
    
    return updatedReminder;
  } catch (error) {
    console.error(`Error recording dose taken:`, error);
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Document with the requested ID could not be found')) {
        throw new Error(`Reminder with ID ${reminderId} not found. The reminder may have been deleted or doesn't exist.`);
      } else if (error.message.includes('Invalid document ID')) {
        throw new Error(`Invalid reminder ID format: ${reminderId}`);
      }
    }
    
    throw error;
  }
};

// Record a medication dose as missed
export const recordDoseMissed = async (reminderId: string) => {
  try {
    console.log(`[recordDoseMissed] Recording dose missed for reminder ID: ${reminderId}`);
    
    let reminderDoc;
    let documentId = reminderId;
    
    // First try to get the reminder by document ID
    try {
      reminderDoc = await remindersCollection.get(reminderId);
      console.log(`[recordDoseMissed] Successfully retrieved reminder by document ID: ${reminderId}`);
    } catch (error) {
      // If that fails, try to find by reminderId field
      console.log(`[recordDoseMissed] Failed to get reminder by document ID, trying reminderId field...`);
      reminderDoc = await remindersCollection.findByReminderId(reminderId);
      
      if (reminderDoc) {
        console.log(`[recordDoseMissed] Found reminder using reminderId field. Document ID is: ${reminderDoc.$id}`);
        documentId = reminderDoc.$id; // Use the document ID for updates
      } else {
        throw new Error(`Reminder with ID ${reminderId} not found. The reminder may have been deleted or doesn't exist.`);
      }
    }
    
    // Update reminder status using the correct document ID
    console.log(`[recordDoseMissed] Updating reminder status with document ID: ${documentId}`);
    const updatedReminder = await remindersCollection.updateStatus(
      documentId,
      'missed',
      new Date()
    );
    
    // Update adherence data using the reminder data
    await updateAdherenceData(reminderDoc.medicineId, reminderDoc.userId, false);
    
    return updatedReminder;
  } catch (error) {
    console.error(`[recordDoseMissed] Error recording dose missed:`, error);
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Document with the requested ID could not be found')) {
        throw new Error(`Reminder with ID ${reminderId} not found. The reminder may have been deleted or doesn't exist.`);
      } else if (error.message.includes('Invalid document ID')) {
        throw new Error(`Invalid reminder ID format: ${reminderId}`);
      }
    }
    
    throw error;
  }
};

// Record a medication dose as snoozed
export const recordDoseSnoozed = async (reminderId: string) => {
  try {
    console.log(`[recordDoseSnoozed] Recording dose snoozed for reminder ID: ${reminderId}`);
    
    let reminderDoc;
    let documentId = reminderId;
    
    // First try to get the reminder by document ID
    try {
      reminderDoc = await remindersCollection.get(reminderId);
      console.log(`[recordDoseSnoozed] Successfully retrieved reminder by document ID: ${reminderId}`);
    } catch (error) {
      // If that fails, try to find by reminderId field
      console.log(`[recordDoseSnoozed] Failed to get reminder by document ID, trying reminderId field...`);
      reminderDoc = await remindersCollection.findByReminderId(reminderId);
      
      if (reminderDoc) {
        console.log(`[recordDoseSnoozed] Found reminder using reminderId field. Document ID is: ${reminderDoc.$id}`);
        documentId = reminderDoc.$id; // Use the document ID for updates
      } else {
        throw new Error(`Reminder with ID ${reminderId} not found. The reminder may have been deleted or doesn't exist.`);
      }
    }
    
    // Update snooze count and status
    const reminder = await remindersCollection.update(documentId, {
      status: 'snoozed',
      snoozeCount: (reminderDoc.snoozeCount || 0) + 1
    });
    
    return reminder;
  } catch (error) {
    console.error(`[recordDoseSnoozed] Error recording dose snoozed:`, error);
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Document with the requested ID could not be found')) {
        throw new Error(`Reminder with ID ${reminderId} not found. The reminder may have been deleted or doesn't exist.`);
      } else if (error.message.includes('Invalid document ID')) {
        throw new Error(`Invalid reminder ID format: ${reminderId}`);
      }
    }
    
    throw error;
  }
};

// Get reminder history
export const getReminderHistory = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    // Format dates for query
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Query for reminders in date range
    const reminders = await remindersCollection.list([
      Query.equal('userId', userId),
      Query.greaterThanEqual('scheduledTime', start.toISOString()),
      Query.lessThanEqual('scheduledTime', end.toISOString())
    ]);
    
    return reminders.documents;
  } catch (error) {
    console.error('Error getting reminder history:', error);
    return [];
  }
};

// Get adherence statistics
export const getAdherenceStats = async (userId: string, startDate: Date, endDate: Date) => {
  try {
    // Format dates for query
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Query for adherence data in date range
    const adherenceData = await adherenceCollection.list([
      Query.equal('userId', userId),
      Query.greaterThanEqual('date', start.toISOString()),
      Query.lessThanEqual('date', end.toISOString())
    ]);
    
    return adherenceData.documents;
  } catch (error) {
    console.error('Error getting adherence stats:', error);
    return [];
  }
};

// Helper function to update adherence data
const updateAdherenceData = async (medicineId: string, userId: string, taken: boolean) => {
  try {
    // Get today's date with time set to start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Try to get existing adherence record for today
    try {
      const adherenceData = await adherenceCollection.list([
        Query.equal('userId', userId),
        Query.equal('medicineId', medicineId),
        Query.equal('date', today.toISOString())
      ]);
      
      if (adherenceData.documents.length > 0) {
        // Update existing record
        const adherence = adherenceData.documents[0];
        
        // Increment taken or missed doses
        const updatedData = {
          scheduledDoses: adherence.scheduledDoses + 1,
          takenDoses: taken ? adherence.takenDoses + 1 : adherence.takenDoses,
          missedDoses: taken ? adherence.missedDoses : adherence.missedDoses + 1,
          adherenceRate: 0 // Will be calculated below
        };
        
        // Calculate new adherence rate
        const adherenceRate = (updatedData.takenDoses / updatedData.scheduledDoses) * 100;
        updatedData.adherenceRate = adherenceRate;
        
        // Update the document
        return await adherenceCollection.update(adherence.adherenceId, updatedData);
      }
    } catch (error) {
      // No existing record found, continue to create new one
      console.log('Creating new adherence record');
    }
    
    // Create new adherence record for today
    return await adherenceCollection.create({
      adherenceId: ID.unique(),
      userId: userId,
      medicineId: medicineId,
      date: today,
      scheduledDoses: 1,
      takenDoses: taken ? 1 : 0,
      missedDoses: taken ? 0 : 1,
      adherenceRate: taken ? 100 : 0,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error updating adherence data:', error);
    throw error;
  }
};

// Clean up old reminders (older than 7 days)
export const cleanupOldReminders = async (userId: string) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    console.log('Cleaning up reminders older than:', sevenDaysAgo.toISOString());
    
    // Query for old reminders
    const oldReminders = await remindersCollection.list([
      Query.equal('userId', userId),
      Query.lessThan('scheduledTime', sevenDaysAgo.toISOString())
    ]);
    
    console.log(`Found ${oldReminders.documents.length} old reminders to clean up`);
    
    // Delete old reminders in batches
    const deletePromises = oldReminders.documents.map(reminder => 
      remindersCollection.delete(reminder.$id)
    );
    
    await Promise.all(deletePromises);
    
    console.log(`Successfully cleaned up ${oldReminders.documents.length} old reminders`);
    return oldReminders.documents.length;
  } catch (error) {
    console.error('Error cleaning up old reminders:', error);
    return 0;
  }
};