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

export default function TermsOfServiceScreen() {
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
      // Removed flexDirection and alignItems as Text doesn't support these
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
    emergencyCard: {
      backgroundColor: '#F8D7DA',
      borderColor: '#F5C6CB',
      borderWidth: 1,
      borderRadius: borderRadius.large,
      padding: spacing.lg,
      marginVertical: spacing.lg,
    },
    emergencyTitle: {
      fontSize: typography.title.fontSize,
      fontWeight: 'bold',
      color: '#721C24',
      marginBottom: spacing.sm,
    },
    emergencyText: {
      fontSize: typography.body.fontSize,
      color: '#721C24',
      lineHeight: 22,
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
        title="Terms of Service"
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
            Welcome to <Text style={styles.highlight}>MedRemind</Text>. By using our medication reminder application, you agree to these Terms of Service. Please read them carefully.
          </Text>
        </View>

        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>
            🚨 Medical Emergency Disclaimer
          </Text>
          <Text style={styles.emergencyText}>
            MedRemind is NOT a substitute for professional medical care. In case of medical emergency, contact emergency services immediately. Do not rely solely on this app for critical medical decisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using MedRemind, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            MedRemind is a <Text style={styles.highlight}>medication reminder and management application</Text> that helps users:
          </Text>
          <Text style={styles.bulletPoint}>• Set medication reminders and notifications</Text>
          <Text style={styles.bulletPoint}>• Track medication adherence</Text>
          <Text style={styles.bulletPoint}>• Monitor medication supplies and refills</Text>
          <Text style={styles.bulletPoint}>• Check for potential drug interactions</Text>
          <Text style={styles.bulletPoint}>• Generate medication reports</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Medical Disclaimer</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.highlight}>IMPORTANT:</Text> MedRemind is not a medical device and does not provide medical advice, diagnosis, or treatment. The app is designed to assist with medication management but should not replace professional medical care.
          </Text>
          <Text style={styles.bulletPoint}>• Always consult healthcare professionals for medical decisions</Text>
          <Text style={styles.bulletPoint}>• Drug interaction information is for reference only</Text>
          <Text style={styles.bulletPoint}>• The app may contain errors or omissions</Text>
          <Text style={styles.bulletPoint}>• We are not responsible for medication-related incidents</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            You agree to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide accurate medication information</Text>
          <Text style={styles.bulletPoint}>• Use the app in accordance with medical instructions</Text>
          <Text style={styles.bulletPoint}>• Keep your account secure and confidential</Text>
          <Text style={styles.bulletPoint}>• Report any app malfunctions or errors</Text>
          <Text style={styles.bulletPoint}>• Comply with applicable laws and regulations</Text>
          <Text style={styles.bulletPoint}>• Not share your account with others</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
          <Text style={styles.paragraph}>
            You may not use MedRemind to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide medical advice to others</Text>
          <Text style={styles.bulletPoint}>• Share prescription medications</Text>
          <Text style={styles.bulletPoint}>• Violate any laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Reverse engineer or modify the app</Text>
          <Text style={styles.bulletPoint}>• Use the app for commercial purposes without permission</Text>
          <Text style={styles.bulletPoint}>• Interfere with app functionality or security</Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>
            ⚠️ Accuracy and Reliability
          </Text>
          <Text style={styles.warningText}>
            While we strive for accuracy, MedRemind may contain errors. Always verify medication information with healthcare professionals. We are not liable for any consequences resulting from app use.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            MedRemind and its content are protected by intellectual property laws. You may not:
          </Text>
          <Text style={styles.bulletPoint}>• Copy, distribute, or modify the app</Text>
          <Text style={styles.bulletPoint}>• Use our trademarks or logos without permission</Text>
          <Text style={styles.bulletPoint}>• Create derivative works based on our content</Text>
          <Text style={styles.bulletPoint}>• Remove copyright or proprietary notices</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Privacy and Data</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using MedRemind, you consent to our privacy practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the maximum extent permitted by law, MedRemind and its developers shall not be liable for:
          </Text>
          <Text style={styles.bulletPoint}>• Any damages arising from app use or inability to use</Text>
          <Text style={styles.bulletPoint}>• Medical complications or adverse drug reactions</Text>
          <Text style={styles.bulletPoint}>• Data loss or corruption</Text>
          <Text style={styles.bulletPoint}>• Third-party actions or content</Text>
          <Text style={styles.bulletPoint}>• Technical failures or interruptions</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold harmless MedRemind, its developers, and affiliates from any claims, damages, or expenses arising from your use of the app or violation of these terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Service Availability</Text>
          <Text style={styles.paragraph}>
            We strive to maintain continuous service but cannot guarantee uninterrupted availability. We may suspend or terminate service for maintenance, updates, or other reasons.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Account Termination</Text>
          <Text style={styles.paragraph}>
            We may suspend or terminate your account if you violate these terms. You may delete your account at any time through the app settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms of Service periodically. We will notify you of significant changes through the app or email. Continued use after changes constitutes acceptance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms are governed by the laws of the United States and the State of California, without regard to conflict of law principles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            Any disputes arising from these terms or your use of MedRemind will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
          </Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms of Service, please contact us:
          </Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <Ionicons name="mail-outline" size={20} color={theme.primary} />
            <Text style={[styles.contactText, styles.emailLink]}>
              anuju760@gmail.com
            </Text>
          </TouchableOpacity>
          
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color={theme.primary} />
            <Text style={styles.contactText}>
              MedRemind Legal Department{'\n'}
              123 Health Tech Drive{'\n'}
              Firozabad, India{'\n'}
              PIN: 283204
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These Terms of Service are effective as of {currentDate} and apply to all users of the MedRemind application.
            {'\n\n'}
            By using MedRemind, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}