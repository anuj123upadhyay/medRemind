# MedRemind Appwrite Integration Guide

This guide explains how to use the Appwrite collections in your MedRemind app.

## Collection Structure

The app uses four main collections:

1. **Users Collection (`users`)** - Store user profiles and preferences
2. **Medicines Collection (`medicines`)** - Store medication details and schedules
3. **Reminders Collection (`reminders`)** - Store individual reminder instances
4. **Adherence Collection (`adherence`)** - Track medication adherence metrics

## How to Use

### Import Services

```typescript
import { 
  usersCollection,
  medicinesCollection, 
  remindersCollection, 
  adherenceCollection 
} from './services/appwrite';
```

### Working with Users

```typescript
// Create a user profile after auth
const createUserProfile = async (userId, userData) => {
  try {
    await usersCollection.create({
      userId: userId,
      username: userData.username,
      email: userData.email,
      // other user data...
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

// Get user profile
const getUserProfile = async (userId) => {
  try {
    const user = await usersCollection.get(userId);
    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
```

### Working with Medicines

```typescript
// Add a new medicine
const addMedicine = async (medicineData) => {
  try {
    const result = await medicinesCollection.create({
      userId: 'current-user-id',
      medicineName: medicineData.name,
      dosage: medicineData.dosage,
      frequency: medicineData.frequency,
      times: medicineData.times, // Array of time strings ["09:00", "21:00"]
      startDate: new Date(),
      isActive: true,
      reminderEnabled: true,
      // other medicine data...
    });
    return result;
  } catch (error) {
    console.error('Error adding medicine:', error);
    return null;
  }
};

// Get all active medicines for a user
const getUserMedicines = async (userId) => {
  try {
    const medicines = await medicinesCollection.listActive(userId);
    return medicines.documents;
  } catch (error) {
    console.error('Error getting medicines:', error);
    return [];
  }
};
```

### Working with Reminders

```typescript
// Create a reminder
const createReminder = async (medicineId, scheduledTime) => {
  try {
    const reminder = await remindersCollection.create({
      medicineId: medicineId,
      userId: 'current-user-id',
      scheduledTime: scheduledTime,
      status: 'pending',
      snoozeCount: 0
    });
    return reminder;
  } catch (error) {
    console.error('Error creating reminder:', error);
    return null;
  }
};

// Mark a reminder as taken
const markReminderAsTaken = async (reminderId) => {
  try {
    await remindersCollection.updateStatus(
      reminderId, 
      'taken', 
      new Date()
    );
  } catch (error) {
    console.error('Error updating reminder:', error);
  }
};

// Get pending reminders for a user
const getPendingReminders = async (userId) => {
  try {
    const reminders = await remindersCollection.listPending(userId);
    return reminders.documents;
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
};
```

### Working with Adherence Data

```typescript
// Create or update adherence data for a day
const updateAdherenceForDay = async (medicineId, date, scheduled, taken) => {
  try {
    const missedDoses = scheduled - taken;
    const adherenceRate = scheduled > 0 ? (taken / scheduled) * 100 : 100;
    
    await adherenceCollection.create({
      userId: 'current-user-id',
      medicineId: medicineId,
      date: date,
      scheduledDoses: scheduled,
      takenDoses: taken,
      missedDoses: missedDoses,
      adherenceRate: adherenceRate,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error updating adherence data:', error);
  }
};

// Get adherence data for a date range
const getMonthlyAdherence = async (userId, startDate, endDate) => {
  try {
    const adherenceData = await adherenceCollection.listByDateRange(
      userId,
      startDate,
      endDate
    );
    return adherenceData.documents;
  } catch (error) {
    console.error('Error getting adherence data:', error);
    return [];
  }
};
```

## Appwrite Setup in App.js or _layout.tsx

Make sure your app initializes the Appwrite client on startup:

```typescript
import { client, account } from './services/appwrite';
import React, { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Initialize Appwrite session or check login status
    const checkSession = async () => {
      try {
        const session = await account.getSession('current');
        console.log('User is logged in:', session);
      } catch (error) {
        console.log('User is not logged in');
      }
    };
    
    checkSession();
  }, []);
  
  // Rest of your app component...
}
```

## Setting up the Appwrite Console

1. Create a new Appwrite project
2. Create a database named 'medremind-db'
3. Create the four collections as specified in collections.ts
4. Add attributes to each collection based on schemas
5. Set up appropriate indexes and permissions
6. Configure authentication providers
