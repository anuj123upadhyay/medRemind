import { Client, Account, Databases, Functions, Storage, Query } from 'react-native-appwrite';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from './collections';

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68386efa00379840dfe3')
    .setPlatform('com.anujupadhyay.MedRemind');

// Initialize services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

// Export Query for use in other files
export { Query };

// Helper functions for handling Appwrite data conversion

/**
 * Converts JSON string fields in Appwrite documents back to objects
 */
export function parseJsonFields<T>(document: any, jsonFields: string[]): T {
  const result = { ...document };
  
  jsonFields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = JSON.parse(result[field]);
      } catch (e) {
        console.error(`Error parsing JSON for field ${field}:`, e);
      }
    }
  });
  
  return result as T;
}

/**
 * Converts objects/arrays to JSON strings for Appwrite storage
 */
export function stringifyJsonFields<T extends Record<string, any>>(
  data: T, 
  jsonFields: string[]
): Record<string, any> {
  const result: Record<string, any> = { ...data };
  
  jsonFields.forEach(field => {
    if (result[field] !== undefined && 
        (Array.isArray(result[field]) || 
         typeof result[field] === 'object')) {
      result[field] = JSON.stringify(result[field]);
    }
  });
  
  return result;
}

// Define JSON fields for each collection
export const JSON_FIELDS = {
  USERS: [],
  MEDICINES: [], // times is now handled as native string array by Appwrite
  REMINDERS: [],
  ADHERENCE: []
};

// Helper functions for collection operations
export const usersCollection = {
  create: async (userData: Partial<User>) => {
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      'unique()',
      userData
    );
  },
  
  get: async (userId: string) => {
    return await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      userId
    );
  },
  
  update: async (userId: string, userData: Partial<User>) => {
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      userData
    );
  },
  
  delete: async (userId: string) => {
    return await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      userId
    );
  },
  
  list: async (queries: string[] = []) => {
    return await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.USERS,
      queries
    );
  }
};

export const medicinesCollection = {
  create: async (medicineData: Partial<Medicine>) => {
    // Process JSON fields before saving
    const processedData = stringifyJsonFields(medicineData, JSON_FIELDS.MEDICINES);
    
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.MEDICINES,
      'unique()',
      processedData
    );
  },
  
  get: async (medicineId: string) => {
    const medicine = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.MEDICINES,
      medicineId
    );
    
    // Parse JSON fields after retrieval
    return parseJsonFields(medicine, JSON_FIELDS.MEDICINES);
  },
  
  update: async (medicineId: string, medicineData: Partial<Medicine>) => {
    // Process JSON fields before saving
    const processedData = stringifyJsonFields(medicineData, JSON_FIELDS.MEDICINES);
    
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.MEDICINES,
      medicineId,
      processedData
    );
  },
  
  delete: async (medicineId: string) => {
    return await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.MEDICINES,
      medicineId
    );
  },
  
  list: async (queries: string[] = []) => {
    const medicines = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.MEDICINES,
      queries
    );
    
    // Parse JSON fields for each document
    if (medicines.documents) {
      medicines.documents = medicines.documents.map(doc => 
        parseJsonFields(doc, JSON_FIELDS.MEDICINES)
      );
    }
    
    return medicines;
  },
  
  listByUser: async (userId: string) => {
    return medicinesCollection.list([
      `userId="${userId}"`
    ]);
  },
  
  listActive: async (userId: string) => {
    return medicinesCollection.list([
      `userId="${userId}"`,
      'isActive=true'
    ]);
  }
};

export const remindersCollection = {
  create: async (reminderData: Partial<Reminder>) => {
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.REMINDERS,
      'unique()',
      reminderData
    );
  },
  
  // Find reminder by its reminderId field (not Appwrite document ID)
  findByReminderId: async (reminderId: string) => {
    try {
      console.log(`[remindersCollection.findByReminderId] Searching for reminder with reminderId field: ${reminderId}`);
      const result = await remindersCollection.list([
        Query.equal('reminderId', reminderId)
      ]);
      
      if (result.documents.length === 0) {
        console.log(`[remindersCollection.findByReminderId] No reminder found with reminderId: ${reminderId}`);
        return null;
      }
      
      console.log(`[remindersCollection.findByReminderId] Found reminder with document ID: ${result.documents[0].$id}`);
      return result.documents[0];
    } catch (error) {
      console.error(`[remindersCollection.findByReminderId] Error searching for reminderId: ${reminderId}`, error);
      throw error;
    }
  },
  
  get: async (reminderId: string) => {
    try {
      console.log(`[remindersCollection.get] Fetching reminder with ID: ${reminderId}`);
      const reminder = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.REMINDERS,
        reminderId
      );
      console.log(`[remindersCollection.get] Successfully retrieved reminder:`, reminder);
      return reminder;
    } catch (error) {
      console.error(`[remindersCollection.get] Error fetching reminder with ID ${reminderId}:`, error);
      throw error;
    }
  },
  
  update: async (reminderId: string, reminderData: Partial<Reminder>) => {
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.REMINDERS,
      reminderId,
      reminderData
    );
  },
  
  updateStatus: async (reminderId: string, status: 'taken' | 'missed' | 'snoozed', actualTime?: Date) => {
    const updateData: Partial<Reminder> = { status };
    
    // Note: actualTime field is not available in the current Appwrite schema
    // Remove actualTime from updates until database schema is updated
    
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.REMINDERS,
      reminderId,
      updateData
    );
  },
  
  delete: async (reminderId: string) => {
    return await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.REMINDERS,
      reminderId
    );
  },
  
  list: async (queries: string[] = []) => {
    return await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.REMINDERS,
      queries
    );
  },
  
  listByUser: async (userId: string) => {
    return remindersCollection.list([
      `userId="${userId}"`
    ]);
  },
  
  listPending: async (userId: string) => {
    return remindersCollection.list([
      `userId="${userId}"`,
      'status="pending"'
    ]);
  },
  
  listByMedicine: async (medicineId: string) => {
    return remindersCollection.list([
      `medicineId="${medicineId}"`
    ]);
  }
};

export const adherenceCollection = {
  create: async (adherenceData: Partial<Adherence>) => {
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ADHERENCE,
      'unique()',
      adherenceData
    );
  },
  
  get: async (adherenceId: string) => {
    return await databases.getDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ADHERENCE,
      adherenceId
    );
  },
  
  update: async (adherenceId: string, adherenceData: Partial<Adherence>) => {
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ADHERENCE,
      adherenceId,
      adherenceData
    );
  },
  
  delete: async (adherenceId: string) => {
    return await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ADHERENCE,
      adherenceId
    );
  },
  
  list: async (queries: string[] = []) => {
    return await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ADHERENCE,
      queries
    );
  },
  
  listByUser: async (userId: string) => {
    return adherenceCollection.list([
      `userId="${userId}"`
    ]);
  },
  
  listByMedicine: async (medicineId: string) => {
    return adherenceCollection.list([
      `medicineId="${medicineId}"`
    ]);
  },
  
  // Get adherence data for a specific timeframe
  listByDateRange: async (userId: string, startDate: string, endDate: string) => {
    return adherenceCollection.list([
      `userId="${userId}"`,
      `date>="${startDate}"`,
      `date<="${endDate}"`
    ]);
  }
};

export { client, account, databases, storage, functions };

// Import interfaces
import { User, Medicine, Reminder, Adherence } from './collections';