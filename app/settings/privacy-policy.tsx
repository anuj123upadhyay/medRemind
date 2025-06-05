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

export default function PrivacyPolicyScreen() {
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
    securityCard: {
      backgroundColor: '#D1ECF1',
      borderColor: '#BEE5EB',
      borderWidth: 1,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      marginVertical: spacing.lg,
    },
    securityTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: '#0C5460',
      marginBottom: spacing.sm,
    },
    securityText: {
      fontSize: typography.body.fontSize,
      color: '#0C5460',
      lineHeight: 22,
    },
    dataTable: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.medium,
      padding: spacing.md,
      marginVertical: spacing.md,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    tableHeader: {
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    tableCell: {
      color: theme.text,
      flex: 1,
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
        title="Privacy Policy"
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
            At <Text style={styles.highlight}>MedRemind</Text>, we are committed to protecting your privacy and ensuring the security of your personal health information. This Privacy Policy explains how we collect, use, protect, and handle your information when you use our medication reminder application.
          </Text>
        </View>

        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>
            🔒 Your Data Security is Our Priority
          </Text>
          <Text style={styles.securityText}>
            We use industry-standard encryption and security measures to protect your sensitive health information. Your medication data is encrypted both in transit and at rest.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>Account Information:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Email address and username</Text>
          <Text style={styles.bulletPoint}>• Phone number (optional)</Text>
          <Text style={styles.bulletPoint}>• Profile picture (optional)</Text>
          <Text style={styles.bulletPoint}>• Account preferences and settings</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>Medication Information:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Medication names and dosages</Text>
          <Text style={styles.bulletPoint}>• Prescription schedules and timing</Text>
          <Text style={styles.bulletPoint}>• Medication adherence data</Text>
          <Text style={styles.bulletPoint}>• Refill reminders and pharmacy information</Text>
          <Text style={styles.bulletPoint}>• Drug interaction alerts you've viewed</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>Usage Information:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• App usage patterns and frequency</Text>
          <Text style={styles.bulletPoint}>• Feature usage analytics</Text>
          <Text style={styles.bulletPoint}>• Error logs and crash reports</Text>
          <Text style={styles.bulletPoint}>• Device information (OS version, device model)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          
          <Text style={styles.paragraph}>
            We use your information to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide medication reminders and notifications</Text>
          <Text style={styles.bulletPoint}>• Track your medication adherence</Text>
          <Text style={styles.bulletPoint}>• Generate health reports and statistics</Text>
          <Text style={styles.bulletPoint}>• Check for potential drug interactions</Text>
          <Text style={styles.bulletPoint}>• Improve app functionality and user experience</Text>
          <Text style={styles.bulletPoint}>• Provide customer support</Text>
          <Text style={styles.bulletPoint}>• Send important app updates and security notices</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
          
          <View style={styles.dataTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Data Type</Text>
              <Text style={styles.tableHeader}>Storage Location</Text>
              <Text style={styles.tableHeader}>Encryption</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Account Info</Text>
              <Text style={styles.tableCell}>Cloud Database</Text>
              <Text style={styles.tableCell}>AES-256</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Medications</Text>
              <Text style={styles.tableCell}>Cloud Database</Text>
              <Text style={styles.tableCell}>AES-256</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Local Cache</Text>
              <Text style={styles.tableCell}>Device Storage</Text>
              <Text style={styles.tableCell}>Device Encryption</Text>
            </View>
          </View>

          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>Security Measures:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• End-to-end encryption for all sensitive data</Text>
          <Text style={styles.bulletPoint}>• Secure authentication protocols</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and penetration testing</Text>
          <Text style={styles.bulletPoint}>• HIPAA-compliant data handling practices</Text>
          <Text style={styles.bulletPoint}>• Multi-factor authentication support</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>We do NOT share your personal health information with third parties, except:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          <Text style={styles.bulletPoint}>• When required by law or legal process</Text>
          <Text style={styles.bulletPoint}>• To protect our rights or property</Text>
          <Text style={styles.bulletPoint}>• In case of medical emergency (with your consent)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>Anonymous Analytics:</Text> We may share aggregated, anonymized usage statistics with our service providers to improve the app, but this data cannot be used to identify you personally.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
          
          <Text style={styles.paragraph}>
            MedRemind integrates with the following third-party services:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Appwrite:</Text> Cloud database and authentication</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Drug Interaction API:</Text> Medication interaction checking</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Push Notification Services:</Text> iOS/Android notifications</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Analytics Services:</Text> Anonymized usage analytics</Text>

          <Text style={styles.paragraph}>
            These services have their own privacy policies and security measures. We carefully vet all third-party providers to ensure they meet our security standards.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            ⚠️ Important: Medical Information Disclaimer
          </Text>
          <Text style={styles.warningText}>
            While we protect your data with the highest security standards, please remember that MedRemind is not a medical device. Always consult healthcare professionals for medical decisions and emergency situations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Privacy Rights</Text>
          
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Access:</Text> Request a copy of your personal data</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Correct:</Text> Update or correct inaccurate information</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Delete:</Text> Request deletion of your account and data</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Export:</Text> Download your medication data</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Opt-out:</Text> Disable analytics and non-essential data collection</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Portability:</Text> Transfer your data to another service</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Data Retention</Text>
          
          <Text style={styles.paragraph}>
            We retain your information for as long as necessary to provide our services:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Active Accounts:</Text> Data retained while account is active</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Deleted Accounts:</Text> Data permanently deleted within 30 days</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Legal Requirements:</Text> Some data may be retained longer if required by law</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Backup Systems:</Text> Deleted data removed from backups within 90 days</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          
          <Text style={styles.paragraph}>
            MedRemind is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will delete such information immediately.
          </Text>
          
          <Text style={styles.paragraph}>
            For users between 13-18, parental consent may be required depending on local laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
          
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own. We ensure that:
          </Text>
          <Text style={styles.bulletPoint}>• All transfers comply with applicable privacy laws</Text>
          <Text style={styles.bulletPoint}>• Adequate safeguards are in place for international transfers</Text>
          <Text style={styles.bulletPoint}>• Data processing agreements meet GDPR and other privacy standards</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Cookies and Tracking</Text>
          
          <Text style={styles.paragraph}>
            MedRemind uses minimal tracking technologies:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Essential Cookies:</Text> Required for app functionality</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>Analytics:</Text> Anonymized usage statistics (opt-out available)</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.highlight}>No Advertising Cookies:</Text> We don't use advertising trackers</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
          
          <Text style={styles.paragraph}>
            We may update this Privacy Policy periodically. We will:
          </Text>
          <Text style={styles.bulletPoint}>• Notify you of significant changes via app notification</Text>
          <Text style={styles.bulletPoint}>• Post the updated policy with a new "Last Updated" date</Text>
          <Text style={styles.bulletPoint}>• Provide 30 days notice for material changes</Text>
          <Text style={styles.bulletPoint}>• Obtain consent for changes that affect how we use your data</Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Privacy Questions & Contacts</Text>
          <Text style={styles.paragraph}>
            For questions about this Privacy Policy or your personal data:
          </Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <Ionicons name="mail-outline" size={20} color={theme.primary} />
            <Text style={[styles.contactText, styles.emailLink]}>
              anuju760@gmail.com
            </Text>
          </TouchableOpacity>
          
          <View style={styles.contactItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
            <Text style={styles.contactText}>
              Data Protection Officer{'\n'}
              MedRemind Privacy Team{'\n'}
              123 Health Tech Drive{'\n'}
              Firozabad, India{'\n'}
              PIN: 283204
            </Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <Text style={styles.contactText}>
              Privacy Requests Response Time:{'\n'}
              • Standard requests: 30 days{'\n'}
              • Urgent security matters: 24-48 hours
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Privacy Policy is effective as of {currentDate} and applies to all users of the MedRemind application.
            {'\n\n'}
            By using MedRemind, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            {'\n\n'}
            For the most current version of this policy, please check the app settings regularly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}