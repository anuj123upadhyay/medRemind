import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/ThemeContext';
import Header from '../../components/Header';
import { createCommonStyles, spacing, typography, borderRadius, shadow } from '../../utils/StyleSystem';

export default function UserGuideScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    lastUpdated: {
      fontSize: typography.caption.fontSize,
      color: theme.textSecondary,
      textAlign: 'center',
      marginVertical: spacing.md,
      fontStyle: 'italic',
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.md,
    },
    subSectionTitle: {
      fontSize: typography.subheader.fontSize,
      fontWeight: '600',
      color: theme.text,
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    paragraph: {
      fontSize: typography.body.fontSize,
      color: theme.text,
      lineHeight: 24,
      marginBottom: spacing.md,
    },
    bulletPoint: {
      fontSize: typography.body.fontSize,
      color: theme.text,
      lineHeight: 24,
      marginBottom: spacing.sm,
      marginLeft: spacing.md,
    },
    highlight: {
      fontWeight: 'bold',
      color: theme.primary,
    },
    warningCard: {
      backgroundColor: '#FFF3CD',
      borderColor: '#FFE69C',
      borderWidth: 1,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      marginVertical: spacing.lg,
    },
    warningTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: '#856404',
      marginBottom: spacing.sm,
    },
    warningText: {
      fontSize: typography.body.fontSize,
      color: '#856404',
      lineHeight: 22,
    },
    infoCard: {
      backgroundColor: theme.card,
      borderColor: theme.primary + '30',
      borderWidth: 1,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      marginVertical: spacing.lg,
      ...shadow.small,
    },
    infoTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: spacing.sm,
    },
    infoText: {
      fontSize: typography.body.fontSize,
      color: theme.text,
      lineHeight: 22,
    },
    tipCard: {
      backgroundColor: '#E8F5E8',
      borderColor: '#C8E6C9',
      borderWidth: 1,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      marginVertical: spacing.lg,
    },
    tipTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: '#2E7D32',
      marginBottom: spacing.sm,
    },
    tipText: {
      fontSize: typography.body.fontSize,
      color: '#2E7D32',
      lineHeight: 22,
    },
    contactCard: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      marginVertical: spacing.lg,
      ...shadow.small,
    },
    contactTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    contactText: {
      fontSize: typography.body.fontSize,
      color: theme.text,
      marginLeft: spacing.sm,
      flex: 1,
    },
    emailLink: {
      color: theme.primary,
      textDecorationLine: 'underline',
    },
    footer: {
      marginTop: spacing.xl,
      marginBottom: spacing.xxl,
    },
    footerText: {
      fontSize: typography.caption.fontSize,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.primary,
      marginTop: 8,
      marginRight: spacing.md,
    },
    timelineContent: {
      flex: 1,
    },
    stepNumber: {
      backgroundColor: theme.primary,
      color: 'white',
      fontSize: typography.caption.fontSize,
      fontWeight: 'bold',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.small,
      overflow: 'hidden',
      textAlign: 'center',
      minWidth: 24,
      marginRight: spacing.sm,
    },
  });

  const handleEmailPress = () => {
    Linking.openURL('mailto:anuju760@gmail.com');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Header
        title="User Guide"
        onBack={() => router.back()}
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        <Text style={styles.lastUpdated}>
          Last updated: {currentDate}
        </Text>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            Welcome to <Text style={styles.highlight}>MedRemind</Text> - your comprehensive medication management companion. This guide explains how to use every feature effectively and understand the app's behavior to help you maintain better medication adherence.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            🎯 Getting Started
          </Text>
          <Text style={styles.infoText}>
            MedRemind is designed to help you never miss a dose while building healthy medication habits. The app emphasizes consistency and accountability by design.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Setting Up Your Medications</Text>
          
          <Text style={styles.subSectionTitle}>Adding a New Medication</Text>
          <View style={styles.timelineItem}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.timelineContent}>
              <Text style={styles.paragraph}>
                Tap the <Text style={styles.highlight}>"Add Medication"</Text> button on the home screen or medications tab.
              </Text>
            </View>
          </View>
          
          <View style={styles.timelineItem}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.timelineContent}>
              <Text style={styles.paragraph}>
                Enter your medication details:
              </Text>
              <Text style={styles.bulletPoint}>• Medication name (be precise for better tracking)</Text>
              <Text style={styles.bulletPoint}>• Dosage (e.g., "10mg", "2 tablets", "5ml")</Text>
              <Text style={styles.bulletPoint}>• Frequency per day (1-6 times daily)</Text>
              <Text style={styles.bulletPoint}>• Duration in days (how long you'll take this medication)</Text>
              <Text style={styles.bulletPoint}>• Current supply (total pills/doses you have)</Text>
              <Text style={styles.bulletPoint}>• Color coding for easy identification</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.timelineContent}>
              <Text style={styles.paragraph}>
                Set your reminder times carefully - these will determine when you receive notifications.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            ⚠️ Important: Duration Field Behavior
          </Text>
          <Text style={styles.warningText}>
            The <Text style={{fontWeight: 'bold'}}>duration field accepts whole numbers only</Text> (days). If you enter "7 days" or "7d", the app will convert it to "7". Always enter just the number of days (e.g., 30, 60, 90).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Taking Your Medications</Text>
          
          <Text style={styles.subSectionTitle}>The Dose Window System</Text>
          <Text style={styles.paragraph}>
            MedRemind uses a <Text style={styles.highlight}>strict timing approach</Text> to encourage medication adherence:
          </Text>
          
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>No "Mark as Taken" button</Text> - doses must be marked when actually taken</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Real-time tracking only</Text> - you cannot retroactively mark doses as taken</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Encourages immediate action</Text> when you receive reminders</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Builds consistent habits</Text> by requiring timely responses</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            🕒 Timing Windows Explained
          </Text>
          <Text style={styles.infoText}>
            When it's time for your medication, you have a limited window to mark it as taken. This design prevents "gaming the system" and encourages real adherence to your medication schedule.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subSectionTitle}>How Dose Tracking Works</Text>
          <Text style={styles.paragraph}>
            The app tracks your medication intake in real-time:
          </Text>
          
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Active period</Text>: 30 minutes before to 2 hours after scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>On-time window</Text>: 30 minutes before to 30 minutes after scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Late window</Text>: 30 minutes to 2 hours after scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Missed dose</Text>: No action taken within 2 hours of scheduled time</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Understanding Your Statistics</Text>
          
          <Text style={styles.subSectionTitle}>Adherence Calculation</Text>
          <Text style={styles.paragraph}>
            Your adherence percentage is calculated as:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Doses Taken ÷ Total Scheduled Doses × 100</Text></Text>
          <Text style={styles.bulletPoint}>• Only includes doses that were due (past scheduled times)</Text>
          <Text style={styles.bulletPoint}>• Future doses are not counted until their time arrives</Text>
          <Text style={styles.bulletPoint}>• Provides accurate real-world adherence rates</Text>

          <Text style={styles.subSectionTitle}>Timing Analysis</Text>
          <Text style={styles.paragraph}>
            The app categorizes your doses by timing:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Early</Text>: Taken more than 30 minutes before scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>On Time</Text>: Taken within ±30 minutes of scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Late</Text>: Taken 30 minutes to 2 hours after scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Missed</Text>: Not taken within 2 hours of scheduled time</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Supply Management</Text>
          
          <Text style={styles.paragraph}>
            MedRemind automatically tracks your medication supply:
          </Text>
          
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Current supply</Text> decreases each time you mark a dose as taken</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Days remaining</Text> calculated based on your frequency</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Low supply alerts</Text> when you have 7 days or less remaining</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Critical alerts</Text> when you have 3 days or less remaining</Text>
          
          <Text style={styles.subSectionTitle}>Refill Tracking</Text>
          <Text style={styles.paragraph}>
            The Refill Tracker helps you:
          </Text>
          <Text style={styles.bulletPoint}>• Monitor which medications need refills soon</Text>
          <Text style={styles.bulletPoint}>• Plan pharmacy visits in advance</Text>
          <Text style={styles.bulletPoint}>• Avoid running out of critical medications</Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            💡 Pro Tip: Supply Management
          </Text>
          <Text style={styles.tipText}>
            Always update your supply count when you get refills. Go to the medication details and update the "Current Supply" field to reflect your new pill count.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Notifications & Reminders</Text>
          
          <Text style={styles.subSectionTitle}>Notification Behavior</Text>
          <Text style={styles.paragraph}>
            MedRemind sends timely reminders to help you stay on track:
          </Text>
          
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Initial reminder</Text> at your scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Follow-up reminders</Text> every 15 minutes for the first hour</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Final reminder</Text> 90 minutes after scheduled time</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Stops reminding</Text> after 2 hours to avoid notification fatigue</Text>

          <Text style={styles.subSectionTitle}>Customizing Notifications</Text>
          <Text style={styles.paragraph}>
            You can adjust notification settings in the app:
          </Text>
          <Text style={styles.bulletPoint}>• Enable/disable sound and vibration</Text>
          <Text style={styles.bulletPoint}>• Choose notification tone</Text>
          <Text style={styles.bulletPoint}>• Set quiet hours to avoid nighttime interruptions</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Calendar & History</Text>
          
          <Text style={styles.subSectionTitle}>Calendar View</Text>
          <Text style={styles.paragraph}>
            The calendar provides a visual overview of your medication schedule:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Daily view</Text> shows all medications for selected day</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Color coding</Text> matches your medication colors</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Status indicators</Text> show taken/missed doses</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Quick actions</Text> for marking doses as taken</Text>

          <Text style={styles.subSectionTitle}>History Tracking</Text>
          <Text style={styles.paragraph}>
            View your complete medication history:
          </Text>
          <Text style={styles.bulletPoint}>• Detailed log of all dose events</Text>
          <Text style={styles.bulletPoint}>• Timing accuracy for each dose</Text>
          <Text style={styles.bulletPoint}>• Patterns in your adherence behavior</Text>
          <Text style={styles.bulletPoint}>• Export data for healthcare providers</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Data Export & Reports</Text>
          
          <Text style={styles.paragraph}>
            MedRemind generates comprehensive reports for healthcare providers:
          </Text>
          
          <Text style={styles.subSectionTitle}>Export Options</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Detailed Report</Text>: Every dose with precise timing</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Daily Summary</Text>: Daily adherence rates and patterns</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Executive Summary</Text>: Overall statistics and recommendations</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>CSV format</Text>: Compatible with spreadsheet applications</Text>

          <Text style={styles.subSectionTitle}>Report Contents</Text>
          <Text style={styles.paragraph}>
            Each report includes:
          </Text>
          <Text style={styles.bulletPoint}>• Medication details and dosing information</Text>
          <Text style={styles.bulletPoint}>• Adherence rates and timing analysis</Text>
          <Text style={styles.bulletPoint}>• Supply management data</Text>
          <Text style={styles.bulletPoint}>• Behavioral patterns and recommendations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Security & Privacy</Text>
          
          <Text style={styles.paragraph}>
            Your medication data is protected with:
          </Text>
          
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Biometric authentication</Text> (Face ID/Touch ID/Fingerprint)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Local data storage</Text> with end-to-end encryption</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Secure cloud backup</Text> with Appwrite infrastructure</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>No data sharing</Text> with third parties without consent</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Troubleshooting Common Issues</Text>
          
          <Text style={styles.subSectionTitle}>Notifications Not Working</Text>
          <Text style={styles.bulletPoint}>• Check app notification permissions in device settings</Text>
          <Text style={styles.bulletPoint}>• Ensure the app isn't in battery optimization mode</Text>
          <Text style={styles.bulletPoint}>• Verify notification settings within the app</Text>
          
          <Text style={styles.subSectionTitle}>Can't Mark Dose as Taken</Text>
          <Text style={styles.bulletPoint}>• Check if you're within the allowed time window</Text>
          <Text style={styles.bulletPoint}>• Ensure you have sufficient medication supply</Text>
          <Text style={styles.bulletPoint}>• Restart the app if the button appears unresponsive</Text>
          
          <Text style={styles.subSectionTitle}>Wrong Statistics</Text>
          <Text style={styles.bulletPoint}>• Verify your medication frequency settings</Text>
          <Text style={styles.bulletPoint}>• Check that start dates are set correctly</Text>
          <Text style={styles.bulletPoint}>• Confirm timezone settings match your location</Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            💡 Best Practices for Success
          </Text>
          <Text style={styles.tipText}>
            • Set reminder times that align with your daily routine{'\n'}
            • Keep your phone charged and nearby during medication times{'\n'}
            • Update supply counts when getting refills{'\n'}
            • Review your statistics weekly to identify patterns{'\n'}
            • Share reports with your healthcare provider during visits
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Understanding App Philosophy</Text>
          
          <Text style={styles.paragraph}>
            MedRemind is designed with specific principles in mind:
          </Text>
          
          <Text style={styles.subSectionTitle}>Accountability Over Convenience</Text>
          <Text style={styles.paragraph}>
            The app prioritizes building real medication habits over providing convenient workarounds. This means:
          </Text>
          <Text style={styles.bulletPoint}>• No retroactive dose marking to prevent false reporting</Text>
          <Text style={styles.bulletPoint}>• Time-limited dose windows to encourage promptness</Text>
          <Text style={styles.bulletPoint}>• Honest statistics that reflect actual behavior</Text>
          
          <Text style={styles.subSectionTitle}>Long-term Health Focus</Text>
          <Text style={styles.paragraph}>
            Features are designed to support sustainable medication management:
          </Text>
          <Text style={styles.bulletPoint}>• Supply tracking prevents medication gaps</Text>
          <Text style={styles.bulletPoint}>• Timing analysis helps optimize dosing schedules</Text>
          <Text style={styles.bulletPoint}>• Reports facilitate better healthcare communication</Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            🚨 Remember: This App Supplements, Never Replaces Medical Care
          </Text>
          <Text style={styles.warningText}>
            MedRemind is a tool to support your medication regimen, but it cannot replace professional medical advice. Always consult your healthcare provider for medical decisions, dosage changes, or if you experience side effects.
          </Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.paragraph}>
            If you have questions about using MedRemind or need technical support:
          </Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <Ionicons name="mail-outline" size={20} color={theme.primary} />
            <Text style={[styles.contactText, styles.emailLink]}>
              anuju760@gmail.com
            </Text>
          </TouchableOpacity>
          
          <View style={styles.contactItem}>
            <Ionicons name="help-circle-outline" size={20} color={theme.primary} />
            <Text style={styles.contactText}>
              Support hours: Monday-Friday, 9 AM - 6 PM IST
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This User Guide was last updated on {currentDate}. We regularly update our features and documentation to serve you better.
            {'\n\n'}
            Thank you for choosing MedRemind for your medication management needs.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
