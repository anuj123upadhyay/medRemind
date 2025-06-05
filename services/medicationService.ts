// Medicine service for managing medications with Appwrite
import { ID, Query } from 'react-native-appwrite';
import { medicinesCollection, remindersCollection, account } from './appwrite';
import { Medicine } from './collections';
import { scheduleNotifications } from '../utils/notifications';

// Add a new medicine
export const addMedicine = async (medicineData: Omit<Medicine, 'medicineId'>) => {
  try {
    const userId = (await account.get()).$id;
    
    // Create medicine document with generated ID
    const medicineDoc = await medicinesCollection.create({
      ...medicineData,
      userId,
      medicineId: ID.unique()
    });
    
    // Convert document to Medicine type
    const medicine = medicineDoc as unknown as Medicine;
    
    // Schedule reminders if enabled
    if (medicine.reminderEnabled) {
      await createRemindersForMedicine(medicine);
    }
    
    return medicine;
  } catch (error) {
    console.error('Error adding medicine:', error);
    throw error;
  }
};

// Get a medicine by ID
export const getMedicineById = async (medicineId: string) => {
  try {
    console.log('getMedicineById called with:', medicineId);
    const result = await medicinesCollection.get(medicineId);
    console.log('getMedicineById succeeded');
    return result;
  } catch (error) {
    console.error('getMedicineById failed for ID:', medicineId);
    console.error('Error details:', error);
    throw error;
  }
};

// Get medicine by its medicineId field (not Appwrite document ID)
export const getMedicineByMedicineId = async (medicineId: string) => {
  try {
    console.log('getMedicineByMedicineId called with:', medicineId);
    
    const result = await medicinesCollection.list([
      Query.equal('medicineId', medicineId)
    ]);
    
    if (result.documents.length === 0) {
      throw new Error(`Medicine with medicineId ${medicineId} not found`);
    }
    
    console.log('getMedicineByMedicineId succeeded, found document with $id:', result.documents[0].$id);
    return result.documents[0];
  } catch (error) {
    console.error('getMedicineByMedicineId failed for medicineId:', medicineId);
    console.error('Error details:', error);
    throw error;
  }
};

// Get all medicines for the current user
export const getUserMedicines = async (activeOnly = true) => {
  try {
    const userId = (await account.get()).$id;
    
    let queries = [Query.equal('userId', userId)];
    if (activeOnly) {
      queries.push(Query.equal('isActive', true));
    }
    
    const medicines = await medicinesCollection.list(queries);
    return medicines.documents;
  } catch (error) {
    console.error('Error getting user medicines:', error);
    return [];
  }
};

// Update a medicine
export const updateMedicine = async (medicineId: string, medicineData: Partial<Medicine>) => {
  try {
    // Update the medicine document
    const updatedMedicineDoc = await medicinesCollection.update(medicineId, medicineData);
    
    // Convert document to Medicine type
    const updatedMedicine = updatedMedicineDoc as unknown as Medicine;
    
    // If reminder times or status changed, update reminders
    if (medicineData.times || medicineData.reminderEnabled !== undefined) {
      // Delete existing reminders
      await deleteRemindersForMedicine(medicineId);
      
      // Create new reminders if enabled
      if (updatedMedicine.reminderEnabled) {
        await createRemindersForMedicine(updatedMedicine);
      }
    }
    
    return updatedMedicine;
  } catch (error) {
    console.error('Error updating medicine:', error);
    throw error;
  }
};

// Delete a medicine
export const deleteMedicine = async (medicineId: string) => {
  try {
    // Delete associated reminders first
    await deleteRemindersForMedicine(medicineId);
    
    // Delete the medicine document
    await medicinesCollection.delete(medicineId);
    return true;
  } catch (error) {
    console.error('Error deleting medicine:', error);
    throw error;
  }
};

// Update medicine supply after taking dose
export const updateMedicineSupply = async (medicineId: string, amount = -1) => {
  try {
    // Get the medicine by its medicineId field (not document ID)
    const medicineDoc = await getMedicineByMedicineId(medicineId);
    const medicine = medicineDoc as unknown as Medicine;
    
    if (medicine.currentSupply !== undefined) {
      const newSupply = Math.max(0, medicine.currentSupply + amount);
      
      // Use the document $id for updates, not the medicineId field
      await medicinesCollection.update(medicineDoc.$id, {
        currentSupply: newSupply
      });
      
      // Check if refill reminder needed - only trigger when crossing the threshold
      // Calculate actual refill threshold count from percentage
      const refillThresholdCount = Math.ceil((medicine.refillAt || 0) / 100 * (medicine.totalSupply || 1));
      
      if (medicine.refillReminder && 
          medicine.refillAt !== undefined && 
          medicine.currentSupply > refillThresholdCount && // Was above threshold
          newSupply <= refillThresholdCount) { // Now at or below threshold
        
        // Import scheduleRefillReminder dynamically to avoid circular imports
        const { scheduleRefillReminder } = await import('../utils/notifications');
        
        // Schedule proper refill reminder with updated supply
        await scheduleRefillReminder({
          ...medicine,
          currentSupply: newSupply
        });
        
        console.log(`🔔 Refill reminder triggered for ${medicine.medicineName}: supply dropped from ${medicine.currentSupply} to ${newSupply} (threshold: ${medicine.refillAt}% = ${refillThresholdCount} doses)`);
      }
      
      return newSupply;
    }
    
    return medicine.currentSupply;
  } catch (error) {
    console.error('Error updating medicine supply:', error);
    throw error;
  }
};

// Helper function to create reminders for a medicine (only for today and future)
const createRemindersForMedicine = async (medicine: Medicine) => {
  try {
    const userId = (await account.get()).$id;
    
    // Get the list of times from the medicine
    const reminderTimes = medicine.times || [];
    
    // Only create reminders for today and future (not past dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(medicine.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    // Use today if medicine was started in the past, otherwise use the actual start date
    const effectiveStartDate = startDate < today ? today : startDate;
    
    // Create a reminder for each time for the effective start date only
    const reminderPromises = reminderTimes.map(async (time) => {
      const scheduledDateTime = createDateFromTime(effectiveStartDate, time);
      
      // Only create reminder if the scheduled time hasn't passed today
      if (scheduledDateTime >= new Date()) {
        return await remindersCollection.create({
          reminderId: ID.unique(),
          medicineId: medicine.medicineId,
          userId: userId,
          scheduledTime: scheduledDateTime,
          status: 'pending',
          snoozeCount: 0
        });
      }
      return null;
    });
    
    const reminders = (await Promise.all(reminderPromises)).filter(r => r !== null);
    
    // Schedule push notifications only for created reminders
    if (reminders.length > 0) {
      await scheduleNotifications(reminders.map(reminder => ({
        title: `Medicine Reminder: ${medicine.medicineName}`,
        body: `Time to take your ${medicine.dosage} of ${medicine.medicineName}`,
        data: { 
          type: 'reminder', 
          medicineId: medicine.medicineId,
          reminderId: reminder.reminderId 
        },
        trigger: { 
          date: new Date(reminder.scheduledTime) 
        }
      })));
    }
    
    return reminders;
  } catch (error) {
    console.error('Error creating reminders:', error);
    throw error;
  }
};

// Helper function to delete reminders for a medicine
const deleteRemindersForMedicine = async (medicineId: string) => {
  try {
    // Query for all reminders for this medicine
    const reminders = await remindersCollection.listByMedicine(medicineId);
    
    // Delete each reminder
    const deletePromises = reminders.documents.map(reminder => 
      remindersCollection.delete(reminder.reminderId)
    );
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error deleting reminders:', error);
    return false;
  }
};

// Helper function to create a date from a time string
const createDateFromTime = (baseDate: Date | string, timeStr: string): Date => {
  // Parse the base date
  const date = new Date(baseDate);
  
  // Parse the time string (format: "HH:MM")
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Set the hours and minutes
  date.setHours(hours, minutes, 0, 0);
  
  return date;
};