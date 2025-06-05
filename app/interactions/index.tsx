import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../utils/ThemeContext';
import { borderRadius, createCommonStyles, shadow, spacing, typography } from '../../utils/StyleSystem';
import { getUserMedicines } from '../../services/medicationService';
import { Medicine } from '../../services/collections';
import Header from '../../components/Header';
import Button from '../../components/Button';
import TextField from '../../components/TextField';

// Legacy type for compatibility
interface Medication {
  id: string;
  name: string;
  medicineName: string;
  dosage: string;
  times: string[];
  startDate: string;
  duration: string;
  color: string;
  reminderEnabled: boolean;
  currentSupply: number;
  totalSupply: number;
  refillAt: number;
  refillReminder: boolean;
  lastRefillDate?: string;
  medicineId: string;
}

// Mock API response for medication interactions
// In a real app, you would connect to a medication database API
const mockCheckInteractions = async (medications: string[]) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock interactions database
  const knownInteractions: Record<string, Record<string, string>> = {
    'aspirin': {
      'warfarin': 'Increased risk of bleeding. Avoid combination if possible.',
      'ibuprofen': 'May decrease cardioprotective effects of aspirin.',
      'clopidogrel': 'May increase risk of bleeding when taken together.',
    },
    'lisinopril': {
      'potassium supplements': 'May cause high potassium levels (hyperkalemia).',
      'spironolactone': 'May increase risk of hyperkalemia.',
      'nsaids': 'May decrease the blood pressure lowering effects.',
    },
    'simvastatin': {
      'grapefruit juice': 'Increases statin concentrations and risk of muscle injury.',
      'clarithromycin': 'Increases risk of muscle pain and damage.',
      'itraconazole': 'Significantly increases risk of muscle damage.',
    },
    'levothyroxine': {
      'calcium': 'Calcium can decrease absorption of levothyroxine.',
      'iron': 'May reduce absorption of levothyroxine.',
      'antacids': 'Reduces absorption of thyroid medication.',
    },
    'metformin': {
      'contrast media': 'Risk of acute kidney injury and lactic acidosis.',
      'alcohol': 'Increases risk of lactic acidosis.',
      'cimetidine': 'May increase metformin concentrations.',
    }
  };
  
  // Generate results
  const results = [];
  
  for (let i = 0; i < medications.length; i++) {
    const med1 = medications[i].toLowerCase();
    
    for (let j = i + 1; j < medications.length; j++) {
      const med2 = medications[j].toLowerCase();
      
      // Check if there's a known interaction
      if (knownInteractions[med1]?.[med2]) {
        results.push({
          medications: [medications[i], medications[j]],
          severity: 'High',
          description: knownInteractions[med1][med2],
        });
      } else if (knownInteractions[med2]?.[med1]) {
        results.push({
          medications: [medications[i], medications[j]],
          severity: 'High',
          description: knownInteractions[med2][med1],
        });
      }
    }
  }
  
  return results;
};

export default function InteractionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const commonStyles = createCommonStyles(theme);
  
  const handleAddMedication = () => {
    if (searchQuery.trim() === '') return;
    
    if (!medications.includes(searchQuery.trim())) {
      setMedications([...medications, searchQuery.trim()]);
      setSearchQuery('');
    } else {
      Alert.alert('Duplicate Medication', 'This medication is already in your list.');
    }
  };
  
  const handleRemoveMedication = (index: number) => {
    const newMedications = [...medications];
    newMedications.splice(index, 1);
    setMedications(newMedications);
  };
  
  const handleCheckInteractions = async () => {
    if (medications.length < 2) {
      Alert.alert('Not Enough Medications', 'Please enter at least two medications to check for interactions.');
      return;
    }
    
    setIsLoading(true);
    setInteractions([]);
    
    try {
      const results = await mockCheckInteractions(medications);
      setInteractions(results);
    } catch (error) {
      console.error('Error checking interactions:', error);
      Alert.alert('Error', 'Failed to check for medication interactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseMyMedications = async () => {
    try {
      const allMedicines = await getUserMedicines();
      
      // Convert Medicine objects to Medication format and extract names
      const convertedMedications: Medication[] = allMedicines.map((medicine: any) => ({
        ...medicine,
        id: medicine.$id,
        name: medicine.medicineName,
        medicineId: medicine.$id,
        startDate: new Date(medicine.startDate).toISOString(),
        duration: medicine.duration === -1 ? "Ongoing" : `${medicine.duration} days`,
        color: medicine.color || "#E91E63",
      }));
      
      const medicationNames = convertedMedications.map(med => med.name);
      setMedications(medicationNames);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load your medications. Please try again.');
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return theme.error;
      case 'moderate':
        return theme.warning;
      case 'low':
        return theme.info;
      default:
        return theme.text;
    }
  };

  return (
    <View style={commonStyles.container}>
      <Header 
        title="Interaction Checker" 
        onBack={() => router.back()}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Check Drug Interactions
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Enter the names of medications to check for potential interactions.
        </Text>
        
        <View style={styles.searchContainer}>
          <TextField
            placeholder="Enter medication name"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="medical-outline"
            returnKeyType="done"
            onSubmitEditing={handleAddMedication}
            containerStyle={styles.searchField}
          />
          <Button
            title="Add"
            onPress={handleAddMedication}
            variant="primary"
            size="medium"
            disabled={!searchQuery.trim()}
            style={styles.addButton}
          />
        </View>
        
        <Button
          title="Use My Medications"
          onPress={handleUseMyMedications}
          variant="outline"
          icon="list-outline"
          style={styles.useMyMedsButton}
        />
        
        {medications.length > 0 && (
          <View style={styles.medicationsList}>
            <Text style={[styles.medicationsTitle, { color: theme.text }]}>
              Medications to check:
            </Text>
            
            <View style={styles.medicationChips}>
              {medications.map((med, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.medicationChip,
                    { backgroundColor: theme.card, borderColor: theme.border }
                  ]}
                >
                  <Text style={[styles.medicationChipText, { color: theme.text }]}>
                    {med}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveMedication(index)}
                    style={[styles.removeButton, { backgroundColor: theme.textTertiary }]}
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <Button
          title="Check Interactions"
          onPress={handleCheckInteractions}
          variant="primary"
          disabled={medications.length < 2 || isLoading}
          loading={isLoading}
          icon="search-outline"
          style={styles.checkButton}
          fullWidth
        />
        
        {interactions.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>
              Potential Interactions Found
            </Text>
            
            {interactions.map((interaction, index) => (
              <View 
                key={index} 
                style={[
                  styles.interactionCard, 
                  { backgroundColor: theme.card, ...shadow.small }
                ]}
              >
                <View style={[
                  styles.severityIndicator, 
                  { backgroundColor: getSeverityColor(interaction.severity) }
                ]} />
                
                <View style={styles.interactionContent}>
                  <View style={styles.medicationPair}>
                    <Text style={[styles.medicationName, { color: theme.text }]}>
                      {interaction.medications[0]}
                    </Text>
                    <View style={styles.interactionIcon}>
                      <Ionicons name="alert-circle" size={16} color={getSeverityColor(interaction.severity)} />
                    </View>
                    <Text style={[styles.medicationName, { color: theme.text }]}>
                      {interaction.medications[1]}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.severityBadge, 
                    { backgroundColor: getSeverityColor(interaction.severity) + '20' }
                  ]}>
                    <Text style={[
                      styles.severityText, 
                      { color: getSeverityColor(interaction.severity) }
                    ]}>
                      {interaction.severity} Risk
                    </Text>
                  </View>
                  
                  <Text style={[styles.interactionDescription, { color: theme.textSecondary }]}>
                    {interaction.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {interactions.length === 0 && !isLoading && medications.length >= 2 && (
          <View style={styles.noInteractionsContainer}>
            <Ionicons name="checkmark-circle" size={60} color={theme.success} />
            <Text style={[styles.noInteractionsText, { color: theme.text }]}>
              No known interactions found
            </Text>
            <Text style={[styles.noInteractionsSubtext, { color: theme.textSecondary }]}>
              No interactions were found between these medications in our database. Always consult with your healthcare provider.
            </Text>
          </View>
        )}
        
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={20} color={theme.textTertiary} />
          <Text style={[styles.disclaimerText, { color: theme.textTertiary }]}>
            This tool provides information about potential drug interactions for educational purposes only. Always consult with a healthcare professional.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.header,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  searchField: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addButton: {
    width: 80,
  },
  useMyMedsButton: {
    marginBottom: spacing.md,
  },
  medicationsList: {
    marginBottom: spacing.md,
  },
  medicationsTitle: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  medicationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  medicationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  medicationChipText: {
    ...typography.body,
    marginRight: spacing.xs,
  },
  removeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButton: {
    marginBottom: spacing.lg,
  },
  resultsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    ...typography.subheader,
    marginBottom: spacing.md,
  },
  interactionCard: {
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  severityIndicator: {
    width: 8,
  },
  interactionContent: {
    flex: 1,
    padding: spacing.md,
  },
  medicationPair: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  medicationName: {
    ...typography.title,
    flex: 1,
  },
  interactionIcon: {
    marginHorizontal: spacing.sm,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  severityText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  interactionDescription: {
    ...typography.body,
  },
  noInteractionsContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
    padding: spacing.lg,
  },
  noInteractionsText: {
    ...typography.subheader,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noInteractionsSubtext: {
    ...typography.body,
    textAlign: 'center',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  disclaimerText: {
    ...typography.caption,
    flex: 1,
    marginLeft: spacing.sm,
  },
});
