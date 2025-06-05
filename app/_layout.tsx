import { Stack, useRouter } from "expo-router";
import { 
  registerForPushNotificationsAsync, 
  handleNotificationResponse, 
  checkMissedNotifications,
  syncNotificationsWithAppwrite,
  maintainContinuousReminders
} from "../utils/notifications";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useEffect } from "react";
import { AuthProvider } from "../components/AuthProvider";

// import { isMigrationCompleted, markMigrationCompleted } from "../utils/notificationMigration";
import * as Notifications from "expo-notifications";
import { ThemeProvider } from "../utils/ThemeContext";
import { account } from "../services/appwrite";

export default function Layout() {
  const router = useRouter();
  
  // Set up notification handler and migration
  useEffect(() => {
    // Using Expo Notifications for all notification functionality
    const initializeNotifications = async () => {
      try {
        // Register for push notifications
        await registerForPushNotificationsAsync();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    initializeNotifications();
    
    // Handle received notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
    
    // Handle notification responses (user tapped notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data as { 
        type?: string; 
        medicineId?: string;
        reminderId?: string;
      };
      
      try {
        // Update Appwrite database based on notification action
        await handleNotificationResponse(response);
        
        // Navigate to appropriate screen based on notification type
        if (data?.type === 'medication') {
          // Navigate to home screen for medication reminders
          router.push('/home');
        } else if (data?.type === 'refill') {
          // Navigate to refill screen 
          router.push('/refills');
        }
      } catch (error) {
        console.error('Error handling notification response:', error);
      }
    });
    
    // Check for missed notifications on app start (when a user is authenticated)
    const checkForMissedReminders = async () => {
      try {
        const currentUser = await account.get();
        if (currentUser?.$id) {
          await checkMissedNotifications(currentUser.$id);
          await syncNotificationsWithAppwrite(currentUser.$id);
          // Maintain continuous reminders to ensure we always have future notifications scheduled
          await maintainContinuousReminders();
        }
      } catch (error) {
        console.log('No authenticated user found or error checking notifications');
      }
    };
    
    checkForMissedReminders();
    
    // Cleanup
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
          animation: "slide_from_right",
          header: () => null,
          navigationBarHidden: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />
         <Stack.Screen
          name="auth/"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="medications/add"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
         <Stack.Screen
          name="calendar"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="refills"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="settings/"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />

        {/* <Stack.Screen
          name="refills/index"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="calendar/index"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        />
        <Stack.Screen
          name="history/index"
          options={{
            headerShown: false,
            headerBackTitle: "",
            title: "",
          }}
        /> */}
      </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}