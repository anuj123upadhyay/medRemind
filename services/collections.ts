// Collections and schema definitions for Appwrite database

// Database and collection names
export const APPWRITE_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;

// Collection IDs
export const COLLECTIONS = {
  USERS: process.env.EXPO_PUBLIC_USERS_COLLECTION_ID!,
  MEDICINES: process.env.EXPO_PUBLIC_MEDICINES_COLLECTION_ID!,
  REMINDERS: process.env.EXPO_PUBLIC_REMINDERS_COLLECTION_ID!,
  ADHERENCE:process.env.EXPO_PUBLIC_ADHERENCE_COLLECTION_ID!
};

// Collection schemas and attribute definitions
export const SCHEMAS = {
  // 1. Users Collection
  USERS: {
    // Required fields
    userID: { type: 'string', required: true }, // Appwrite user ID
    username: { type: 'string', required: true }, // Username
    email: { type: 'string', required: true }, // Email address
    
    // Optional fields
    phone: { type: 'string', required: false }, // Phone number
    dateOfBirth: { type: 'datetime', required: false }, // Birth date
  },
  
  // 2. Medicines Collection
  MEDICINES: {
    // Required fields
    medicineId: { type: 'string', required: true }, // Unique medicine ID
    userId: { type: 'string', required: true }, // Owner's user ID
    medicineName: { type: 'string', required: true }, // Medicine name
    dosage: { type: 'string', required: true }, // Dosage amount (e.g., "10mg", "2 tablets")
    frequency: { type: 'string', required: true }, // Daily, weekly, monthly, custom
    times: { type: 'string[]', required: true }, // Time slots ["09:00", "13:00", "21:00"]
    startDate: { type: 'datetime', required: true }, // Treatment start date
    isActive: { type: 'boolean', required: true }, // Active status
    reminderEnabled: { type: 'boolean', required: true }, // Reminder enabled/disabled
    
    // Optional fields
    color: { type: 'string', required: false }, // Medicine color
    endDate: { type: 'datetime', required: false }, // Treatment end date
    duration: { type: 'integer', required: false }, // Total duration in days
    durationLeft: { type: 'integer', required: false }, // Days remaining
    currentSupply: { type: 'integer', required: false }, // Current pills/doses available
    totalSupply: { type: 'integer', required: false }, // Total supply when full
    refillReminder: { type: 'boolean', required: false }, // Enable refill reminders
    refillAt: { type: 'integer', required: false }, // Refill when supply reaches this number
    lastRefillDate: { type: 'datetime', required: false }, // Last refill date
    notes: { type: 'string', required: false }, // Additional notes
    // Calendar-based reminder tracking
    calendarEventIds: { type: 'string[]', required: false }, // IDs of calendar events created for this medicine
    reminderMethod: { type: 'string', required: false }, // Current reminder method
    lastCalendarSync: { type: 'datetime', required: false }, // Last time calendar events were synced
    calendarPermissionGranted: { type: 'boolean', required: false }, // Whether calendar permissions are available
  },
  
  // 3. Reminders Collection
  REMINDERS: {
    // Required fields
    reminderId: { type: 'string', required: true }, // Unique reminder ID
    medicineId: { type: 'string', required: true }, // Reference to medicine
    userId: { type: 'string', required: true }, // Owner's user ID
    scheduledTime: { type: 'datetime', required: true }, // When reminder should fire
    status: { type: 'string', required: true }, // pending, taken, missed, snoozed
    
    // Optional fields
    actualTime: { type: 'datetime', required: false }, // When user responded
    snoozeCount: { type: 'integer', required: false, default: 0 }, // Number of snoozes
  },
  
  // 4. Adherence Collection
  ADHERENCE: {
    // Required fields
    adherenceId: { type: 'string', required: true }, // Unique adherence ID
    userId: { type: 'string', required: true }, // Owner's user ID
    medicineId: { type: 'string', required: true }, // Reference to medicine
    date: { type: 'datetime', required: true }, // Date of tracking
    scheduledDoses: { type: 'integer', required: true }, // Total doses scheduled
    takenDoses: { type: 'integer', required: true }, // Doses actually taken
    missedDoses: { type: 'integer', required: true }, // Doses missed
    adherenceRate: { type: 'integer', required: true }, // Percentage (0-100)
    createdAt: { type: 'datetime', required: true }, // Creation timestamp
  }
};

// Helper types for TypeScript
export interface User {
  userID: string;
  username: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  expoPushToken?: string;
}

export interface Medicine {
  medicineId: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: Date;
  isActive: boolean;
  reminderEnabled: boolean;
  color?: string;
  icon?: string;
  endDate?: Date;
  duration?: number;
  durationLeft?: number;
  currentSupply?: number;
  totalSupply?: number;
  refillReminder?: boolean;
  refillAt?: number;
  lastRefillDate?: Date;
  notes?: string;
  // Calendar-based reminder tracking
  calendarEventIds?: string[]; // IDs of calendar events created for this medicine
  reminderMethod?: 'hybrid' | 'calendar-only' | 'notifications-only'; // Current reminder method
  lastCalendarSync?: Date; // Last time calendar events were synced
  calendarPermissionGranted?: boolean; // Whether calendar permissions are available
}

export interface Reminder {
  reminderId: string;
  medicineId: string;
  userId: string;
  scheduledTime: Date;
  status: 'pending' | 'taken' | 'missed' | 'snoozed';
  actualTime?: Date; // Not available in current Appwrite schema
  snoozeCount?: number;
}

export interface Adherence {
  adherenceId: string;
  userId: string;
  medicineId: string;
  date: Date;
  scheduledDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  createdAt: Date;
}

// Export union type for collection names
export type CollectionName = keyof typeof COLLECTIONS;

// Export collection attributes by name
export const getCollectionAttributes = (collectionName: CollectionName) => {
  return SCHEMAS[collectionName];
};