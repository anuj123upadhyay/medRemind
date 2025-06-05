// // // filepath: /Users/anujupadhyay/Desktop/medremind/medRemind/app/stats/index.tsx
// // import React, { useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   Dimensions,
// //   ScrollView,
// //   ActivityIndicator,
// //   Alert,
// // } from 'react-native';
// // import { useFocusEffect } from '@react-navigation/native';
// // import { Ionicons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { useTheme } from '../../utils/ThemeContext';
// // import { getUserMedicines } from '../../services/medicationService';
// // import { getReminderHistory, getAdherenceStats } from '../../services/doseHistoryService';
// // import { account } from '../../services/appwrite';
// // import { Medicine } from '../../services/collections';
// // import { borderRadius, createCommonStyles, shadow, spacing, typography } from '../../utils/StyleSystem';
// // import Header from '../../components/Header';
// // import Button from '../../components/Button';
// // import { LinearGradient } from 'expo-linear-gradient';
// // import Svg, { Path, Circle, Line } from 'react-native-svg';
// // import * as Haptics from 'expo-haptics';
// // import { 
// //   exportAdherenceReport, 
// //   MedicationAdherenceData
// // } from '../../utils/exportData';

// // const { width } = Dimensions.get('window');
// // const BAR_HEIGHT = 180;

// // interface MedicationStat {
// //   id: string;
// //   name: string;
// //   color: string;
// //   totalDoses: number;
// //   takenDoses: number;
// //   missedDoses: number;
// //   adherenceRate: number;
// //   onTimeDoses: number;
// //   lateDoses: number;
// //   averageDelay: number;
// //   dosesPerDay: number; // Number of doses per day based on medication frequency
// // }

// // interface AdherenceTrend {
// //   date: string;
// //   adherenceRate: number;
// // }

// // interface DailyDose {
// //   medicationId: string;
// //   medicationName: string;
// //   color: string;
// //   scheduledTime: string;
// //   wasTaken: boolean;
// //   timeTaken?: string;
// //   delay?: number;
// //   frequency?: number; // Number of doses per day for this medication
// // }

// // interface DailyDoses {
// //   date: string;
// //   doses: DailyDose[];
// //   adherenceRate: number;
// // }

// // export default function StatsScreen() {
// //   const router = useRouter();
// //   const { theme, isDark } = useTheme();
// //   const [stats, setStats] = useState<MedicationStat[]>([]);
// //   const [overallAdherence, setOverallAdherence] = useState(0);
// //   const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
// //   const [adherenceTrend, setAdherenceTrend] = useState<AdherenceTrend[]>([]);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isExporting, setIsExporting] = useState(false);
// //   const [dailyDoses, setDailyDoses] = useState<DailyDoses[]>([]);
// //   const commonStyles = createCommonStyles(theme);
  
// //   // Helper function to format frequency text consistently
// //   const formatFrequencyText = (frequency: number): string => {
// //     if (frequency === 1) return 'Once daily';
// //     if (frequency === 2) return 'Twice daily';
// //     if (frequency === 3) return 'Three times daily';
// //     if (frequency === 4) return 'Four times daily';
// //     return `${frequency} times daily`;
// //   };

// //   // Helper function to generate a dose count display
// //   const formatDoseCount = (takenDoses: number, totalDoses: number, frequency: number): string => {
// //     // Calculate total days this covers (total doses divided by daily frequency)
// //     const days = Math.floor(totalDoses / frequency);
// //     // Calculate taken days (taken doses divided by frequency, capped at total days)
// //     const takenDays = Math.min(Math.floor(takenDoses / frequency), days);
// //     return `Taken: ${takenDoses} of ${totalDoses} doses (${takenDays} of ${days} days)`;
// //   };
  
// //   // Function to render the adherence trend chart
// //   const renderAdherenceTrendChart = () => {
// //     if (adherenceTrend.length === 0) return null;
    
// //     const chartHeight = 150;
// //     const chartWidth = width - spacing.md * 4;
// //     const chartPadding = 20;
// //     const usableHeight = chartHeight - chartPadding * 2;
// //     const usableWidth = chartWidth - chartPadding * 2;
    
// //     const xStep = usableWidth / Math.max(adherenceTrend.length - 1, 1);
    
// //     // Generate path for the trend line
// //     let pathD = '';
// //     const points = adherenceTrend.map((item, index) => {
// //       // Convert adherence rate to Y coordinate
// //       // 100% adherence = top of chart (0), 0% = bottom (chartHeight)
// //       const x = chartPadding + index * xStep;
// //       const y = chartPadding + usableHeight - (usableHeight * Math.min(item.adherenceRate, 100) / 100);
      
// //       if (index === 0) {
// //         pathD = `M ${x},${y}`;
// //       } else {
// //         pathD += ` L ${x},${y}`;
// //       }
      
// //       return { x, y, adherenceRate: item.adherenceRate };
// //     });

// //     return (
// //       <Svg height={chartHeight} width="100%" style={{ marginTop: spacing.md }}>
// //         {/* Chart grid lines */}
// //         <Line 
// //           x1={chartPadding} 
// //           y1={chartPadding} 
// //           x2={chartPadding} 
// //           y2={chartHeight - chartPadding}
// //           stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
// //           strokeWidth="1"
// //         />
// //         <Line 
// //           x1={chartPadding} 
// //           y1={chartHeight - chartPadding} 
// //           x2={chartWidth - chartPadding} 
// //           y2={chartHeight - chartPadding}
// //           stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
// //           strokeWidth="1"
// //         />
        
// //         {/* 50% line */}
// //         <Line 
// //           x1={chartPadding} 
// //           y1={chartPadding + usableHeight/2} 
// //           x2={chartWidth - chartPadding} 
// //           y2={chartPadding + usableHeight/2}
// //           stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
// //           strokeWidth="1"
// //           strokeDasharray="5,5"
// //         />
        
// //         {/* Trend line */}
// //         <Path
// //           d={pathD}
// //           stroke={theme.primary}
// //           strokeWidth="2"
// //           fill="none"
// //         />
        
// //         {/* Data points */}
// //         {points.map((point, index) => (
// //           <Circle
// //             key={index}
// //             cx={point.x}
// //             cy={point.y}
// //             r="3"
// //             fill={getAdherenceColor(point.adherenceRate)}
// //             stroke="white"
// //             strokeWidth="1"
// //           />
// //         ))}
// //       </Svg>
// //     );
// //   };

// //   useEffect(() => {
// //     loadStats();
// //   }, [timeRange]);

// //   // Reload stats when screen comes into focus (when user returns from marking doses)
// //   useFocusEffect(
// //     useCallback(() => {
// //       loadStats();
// //     }, [timeRange])
// //   );

// //   // Helper function to process reminder history into adherence data format
// //   const processReminderHistoryToAdherenceData = (medicines: any[], reminderHistory: any[], startDate: Date, endDate: Date): MedicationAdherenceData[] => {
// //     const adherenceData: MedicationAdherenceData[] = [];
    
// //     // Create a map for quick medicine lookup
// //     const medicineMap = new Map<string, any>();
// //     medicines.forEach(medicine => {
// //       medicineMap.set(medicine.medicineId, medicine);
// //     });
    
// //     // Process each reminder
// //     reminderHistory.forEach(reminder => {
// //       const medicine = medicineMap.get(reminder.medicineId);
// //       if (!medicine) return;
      
// //       const scheduledTime = new Date(reminder.scheduledTime);
// //       const date = scheduledTime.toISOString().split('T')[0];
      
// //       // Calculate delay if taken
// //       let delay = 0;
// //       if (reminder.status === 'taken' && reminder.actualTime) {
// //         const actualTime = new Date(reminder.actualTime);
// //         delay = Math.max(0, (actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60)); // Minutes
// //       }
      
// //       adherenceData.push({
// //         medicationId: reminder.medicineId,
// //         medicationName: medicine.medicineName,
// //         date: date,
// //         scheduledTime: scheduledTime.toTimeString().slice(0, 5), // HH:MM format
// //         wasTaken: reminder.status === 'taken',
// //         timeTaken: reminder.actualTime ? new Date(reminder.actualTime).toTimeString().slice(0, 5) : undefined,
// //         delay: reminder.status === 'taken' ? delay : undefined
// //       });
// //     });
    
// //     return adherenceData;
// //   };

// //   const loadStats = async () => {
// //     try {
// //       setIsLoading(true);
      
// //       // Get current user ID
// //       const userId = (await account.get()).$id;
      
// //       // Get date range based on selected time range
// //       const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
      
// //       // Fetch data from Appwrite services
// //       const [medicines, reminderHistory, adherenceData] = await Promise.all([
// //         getUserMedicines(true), // Only active medicines
// //         getReminderHistory(userId, startDate, endDate),
// //         getAdherenceStats(userId, startDate, endDate),
// //       ]);

// //       console.log('=== STATS DEBUG: Loaded raw data ===');
// //       console.log('Medicines count:', medicines.length);
// //       console.log('Reminder history count:', reminderHistory.length);
// //       console.log('Adherence data count:', adherenceData.length);
      
// //       console.log('Sample medicine:', medicines[0]);
// //       console.log('Sample reminder:', reminderHistory[0]);
// //       console.log('Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
      
// //       // Process adherence data using our utility (we'll need to adapt this)
// //       const processedAdherenceData = processReminderHistoryToAdherenceData(medicines, reminderHistory, startDate, endDate);
      
// //       // Generate daily adherence trend data
// //       const trendData = generateAdherenceTrend(processedAdherenceData, startDate, endDate, medicines);
// //       setAdherenceTrend(trendData);

// //       // Calculate stats for each medication
// //       const medicationStats: MedicationStat[] = medicines.map((medication: any) => {
// //         // Filter adherence data for this medication
// //         let medicationAdherenceData = processedAdherenceData.filter(
// //           data => data.medicationId === medication.medicineId
// //         );
        
// //         // Group by date to calculate correct doses based on frequency
// //         const dateGroups: Record<string, MedicationAdherenceData[]> = {};
        
// //         medicationAdherenceData.forEach(data => {
// //           if (!dateGroups[data.date]) {
// //             dateGroups[data.date] = [];
// //           }
// //           dateGroups[data.date].push(data);
// //         });
        
// //         // Calculate daily stats based on medication's daily frequency (times per day)
// //         let totalDoses = 0;
// //         let takenDoses = 0;
// //         let onTimeDoses = 0;
// //         let lateDoses = 0;
// //         let delaySum = 0;
// //         let delayCount = 0;
        
// //         // Process each date
// //         Object.entries(dateGroups).forEach(([date, doses]) => {
// //           // For each date, we expect medication.times.length doses (the medication's frequency per day)
// //           const dosesPerDay = medication.times.length;
// //           totalDoses += dosesPerDay; // Add this number of doses to the total
          
// //           // Count taken doses for this day (limited to dosesPerDay to prevent exceeding expected doses)
// //           const takenForDay = Math.min(doses.filter(d => d.wasTaken).length, dosesPerDay);
// //           takenDoses += takenForDay;
          
// //           // Count on-time and late doses, properly limited by dosesPerDay
// //           const takenDosesList = doses.filter(d => d.wasTaken);
// //           const onTimeForDay = takenDosesList.filter(d => d.delay !== undefined && d.delay <= 30 && d.delay >= 0).length;
// //           const lateForDay = takenDosesList.filter(d => d.delay !== undefined && d.delay > 30).length;
          
// //           onTimeDoses += Math.min(onTimeForDay, dosesPerDay);
// //           lateDoses += Math.min(lateForDay, dosesPerDay);
          
// //           // Accumulate delay data for average calculation
// //           takenDosesList.forEach(dose => {
// //             if (dose.delay !== undefined) {
// //               delaySum += dose.delay;
// //               delayCount++;
// //             }
// //           });
// //         });
        
// //         const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
// //         const averageDelay = delayCount > 0 ? delaySum / delayCount : 0;
// //         const missedDoses = totalDoses - takenDoses;
        
// //         return {
// //           id: medication.medicineId,
// //           name: medication.medicineName,
// //           color: medication.color || '#3498db',
// //           totalDoses: totalDoses,
// //           takenDoses: takenDoses,
// //           missedDoses: missedDoses,
// //           adherenceRate: adherenceRate,
// //           onTimeDoses: onTimeDoses,
// //           lateDoses: lateDoses,
// //           averageDelay: averageDelay,
// //           dosesPerDay: medication.times.length, // Add the medication frequency (doses per day)
// //         };
// //       }).filter((stat: any) => stat.totalDoses > 0); // Only include medications with scheduled doses
      
// //       // Sort by adherence rate (highest first)
// //       medicationStats.sort((a, b) => b.adherenceRate - a.adherenceRate);
      
// //       // Calculate overall adherence
// //       const totalExpectedDoses = medicationStats.reduce((sum, stat) => sum + stat.totalDoses, 0);
// //       const totalTakenDoses = medicationStats.reduce((sum, stat) => sum + stat.takenDoses, 0);
// //       const overall = totalExpectedDoses > 0 ? (totalTakenDoses / totalExpectedDoses) * 100 : 0;
      
// //       setStats(medicationStats);
// //       setOverallAdherence(overall);
      
// //       // Generate daily doses data
// //       const dailyDosesData = generateDailyDoses(medicines, reminderHistory, startDate, endDate);
// //       console.log('=== STATS DEBUG: Generated daily doses ===');
// //       console.log('Daily doses count:', dailyDosesData.length);
// //       console.log('Sample daily dose:', dailyDosesData[0]);
// //       if (dailyDosesData[0]) {
// //         console.log('First day doses:', dailyDosesData[0].doses);
// //       }
// //       setDailyDoses(dailyDosesData);
// //     } catch (error) {
// //       console.error('Error loading stats:', error);
// //       Alert.alert('Error', 'Failed to load medication statistics');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const getDateRangeFromTimeRange = (range: 'week' | 'month' | 'year') => {
// //     const now = new Date();
// //     const endDate = new Date(now);
// //     endDate.setHours(23, 59, 59, 999);
    
// //     const startDate = new Date(now);
// //     startDate.setHours(0, 0, 0, 0);
    
// //     switch (range) {
// //       case 'week':
// //         // Show rolling 7-day periods: if today is Monday, show Mon-Sun
// //         // If today is Wednesday, show Thu (last week) to Wed (this week)
// //         // This ensures continuous data visibility across weeks
// //         startDate.setDate(now.getDate() - 6); // Always show last 7 days including today
// //         break;
// //       case 'month':
// //         // For months, show rolling 30-day periods to ensure continuous data
// //         // This way when a new month starts, you still see recent data
// //         startDate.setDate(now.getDate() - 29); // Last 30 days including today
// //         break;
// //       case 'year':
// //         // For year view, show rolling 365-day periods
// //         // This ensures you always see a full year of data, not just calendar year
// //         startDate.setDate(now.getDate() - 364); // Last 365 days including today
// //         break;
// //     }
    
// //     return { startDate, endDate };
// //   };

// //   const generateAdherenceTrend = (adherenceData: any[], startDate: Date, endDate: Date, medicines: any[]): AdherenceTrend[] => {
// //     const result: AdherenceTrend[] = [];
// //     const dayMilliseconds = 24 * 60 * 60 * 1000;
    
// //     // Keep track of total doses and taken doses by date
// //     const groupedByDateAndMed: Record<string, Record<string, { 
// //       total: number, 
// //       taken: number,
// //       frequency: number // Store medication frequency
// //     }>> = {};
    
// //     // Initialize all dates in the range
// //     for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMilliseconds)) {
// //       const dateStr = d.toISOString().split('T')[0];
// //       groupedByDateAndMed[dateStr] = {};
// //     }
    
// //     // Create a medicine lookup map
// //     const medicinesCache = new Map<string, any>();
// //     medicines.forEach(medicine => {
// //       medicinesCache.set(medicine.medicineId, { 
// //         id: medicine.medicineId, 
// //         name: medicine.medicineName, 
// //         times: { length: medicine.times.length } 
// //       });
// //     });
    
// //     // Populate with actual data, tracking by medication
// //     adherenceData.forEach((data: any) => {
// //       if (!groupedByDateAndMed[data.date]) {
// //         groupedByDateAndMed[data.date] = {};
// //       }
      
// //       // Initialize medication tracking if not exist
// //       if (!groupedByDateAndMed[data.date][data.medicationId]) {
// //         // Get the medication frequency from our cache
// //         const med = medicinesCache.get(data.medicationId);
// //         const frequency = med ? med.times.length : 1;
        
// //         groupedByDateAndMed[data.date][data.medicationId] = { 
// //           total: frequency, // Set expected doses based on frequency
// //           taken: 0,
// //           frequency: frequency
// //         };
// //       }
      
// //       // Count taken doses by medication, limited to frequency
// //       if (data.wasTaken) {
// //         const currentMed = groupedByDateAndMed[data.date][data.medicationId];
// //         if (currentMed.taken < currentMed.frequency) {
// //           currentMed.taken += 1;
// //         }
// //       }
// //     });
    
// //     // Convert to trend data format and sort by date
// //     // Process each date and calculate total adherence across all medications
// //     for (const [date, medications] of Object.entries(groupedByDateAndMed)) {
// //       let totalDoses = 0;
// //       let takenDoses = 0;
      
// //       // Sum all medications for this date
// //       Object.values(medications).forEach(medStats => {
// //         totalDoses += medStats.total;
// //         takenDoses += medStats.taken;
// //       });
      
// //       const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
// //       result.push({ date, adherenceRate });
// //     }
    
// //     return result.sort((a, b) => a.date.localeCompare(b.date));
// //   };

// //   const generateDailyDoses = (medicines: any[], reminderHistory: any[], startDate: Date, endDate: Date): DailyDoses[] => {
// //     console.log('=== generateDailyDoses DEBUG ===');
// //     console.log('Input medicines:', medicines.length);
// //     console.log('Input reminderHistory:', reminderHistory.length);
// //     console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());
    
// //     const result: DailyDoses[] = [];
// //     const dayMilliseconds = 24 * 60 * 60 * 1000;
    
// //     // Process adherence data using our utility
// //     const adherenceData = processReminderHistoryToAdherenceData(medicines, reminderHistory, startDate, endDate);
// //     console.log('Processed adherence data:', adherenceData.length);
// //     console.log('Sample adherence data:', adherenceData[0]);
    
// //     // Create a map for medications for quick lookup
// //     const medMap = new Map<string, any>();
// //     medicines.forEach(med => {
// //       medMap.set(med.medicineId, med);
// //     });
    
// //     // Group by date
// //     const groupedByDate = new Map<string, MedicationAdherenceData[]>();
    
// //     // Initialize all dates in the range
// //     for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMilliseconds)) {
// //       const dateStr = d.toISOString().split('T')[0];
// //       groupedByDate.set(dateStr, []);
// //     }
    
// //     // Group adherence data by date, handling different medication frequencies
// //     console.log('=== GROUPING ADHERENCE DATA ===');
// //     console.log('Available dates in groupedByDate map:', Array.from(groupedByDate.keys()));
// //     console.log('Available medication IDs in medMap:', Array.from(medMap.keys()));
    
// //     adherenceData.forEach((data, index) => {
// //       console.log(`Processing adherence data [${index}]:`, {
// //         date: data.date,
// //         medicationId: data.medicationId,
// //         medicationName: data.medicationName,
// //         wasTaken: data.wasTaken,
// //         scheduledTime: data.scheduledTime
// //       });
      
// //       const dateGroup = groupedByDate.get(data.date) || [];
// //       console.log(`Date group for ${data.date} before processing:`, dateGroup.length, 'items');
      
// //       const medication = medMap.get(data.medicationId);
// //       console.log('Found medication for ID:', data.medicationId, medication ? 'YES' : 'NO');
// //       if (medication) {
// //         console.log('Medication details:', {
// //           medicineId: medication.medicineId,
// //           name: medication.medicineName,
// //           timesLength: medication.times ? medication.times.length : 'NO TIMES ARRAY'
// //         });
// //       }
      
// //       if (!medication) {
// //         // If medication not found (unlikely), just add the data
// //         dateGroup.push(data);
// //       } else {
// //         const dosesPerDay = medication.times.length;
        
// //         if (dosesPerDay === 1) {
// //           // For once-daily medications, check if we already have an entry
// //           const existingMed = dateGroup.find(item => item.medicationId === data.medicationId);
          
// //           if (existingMed) {
// //             // If this dose was taken and the existing one wasn't, replace it
// //             if (data.wasTaken && !existingMed.wasTaken) {
// //               const index = dateGroup.indexOf(existingMed);
// //               dateGroup[index] = data;
// //             }
// //             // Otherwise keep the existing entry (avoid duplicates for once-daily meds)
// //           } else {
// //             // First entry for this medication on this date
// //             dateGroup.push(data);
// //           }
// //         } else {
// //           // For multi-dose medications, match by scheduled time
// //           const existingMedAtSameTime = dateGroup.find(item => 
// //             item.medicationId === data.medicationId && item.scheduledTime === data.scheduledTime
// //           );
          
// //           if (existingMedAtSameTime) {
// //             // If this is a duplicate time slot and was taken, replace if current is not taken
// //             if (data.wasTaken && !existingMedAtSameTime.wasTaken) {
// //               const index = dateGroup.indexOf(existingMedAtSameTime);
// //               dateGroup[index] = data;
// //             }
// //           } else {
// //             // New time slot for this medication
// //             dateGroup.push(data);
// //           }
// //         }
// //       }
      
// //       groupedByDate.set(data.date, dateGroup);
// //       console.log(`Updated date group for ${data.date} now has ${dateGroup.length} doses`);
// //       console.log('Updated date group contents:', dateGroup.map(d => ({
// //         medicationName: d.medicationName,
// //         scheduledTime: d.scheduledTime,
// //         wasTaken: d.wasTaken
// //       })));
// //     });
    
// //     // Convert map to array of DailyDoses
// //     console.log('=== CONVERTING TO DAILY DOSES ===');
// //     console.log('Total dates in groupedByDate:', groupedByDate.size);
    
// //     groupedByDate.forEach((adherenceItems, date) => {
// //       console.log(`Processing date: ${date} with ${adherenceItems.length} adherence items`);
// //       if (adherenceItems.length > 0) {
// //         console.log('Adherence items for', date, ':', adherenceItems.map(item => ({
// //           medicationName: item.medicationName,
// //           scheduledTime: item.scheduledTime,
// //           wasTaken: item.wasTaken
// //         })));
// //       }
      
// //       const doses: DailyDose[] = adherenceItems.map(item => {
// //         const med = medMap.get(item.medicationId);
// //         console.log(`Creating dose for ${item.medicationName} on ${date}:`, {
// //           medicationId: item.medicationId,
// //           found_med: med ? 'YES' : 'NO',
// //           scheduledTime: item.scheduledTime,
// //           wasTaken: item.wasTaken
// //         });
        
// //         return {
// //           medicationId: item.medicationId,
// //           medicationName: item.medicationName,
// //           color: med?.color || "#CCCCCC",
// //           scheduledTime: item.scheduledTime,
// //           wasTaken: item.wasTaken,
// //           timeTaken: item.timeTaken,
// //           delay: item.delay,
// //           frequency: med?.times.length // Include medication frequency information
// //         };
// //       });
      
// //       console.log(`Created ${doses.length} doses for ${date}`);
      
// //       // Calculate adherence rate for the day
// //       const totalDoses = doses.length;
// //       const takenDoses = doses.filter(dose => dose.wasTaken).length;
// //       const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
      
// //       console.log(`Day ${date} stats: ${takenDoses}/${totalDoses} doses taken (${adherenceRate.toFixed(1)}%)`);
      
// //       result.push({
// //         date,
// //         doses,
// //         adherenceRate
// //       });
// //     });
    
// //     // Sort by date (most recent first)
// //     console.log('generateDailyDoses result:', result.length, 'days');
// //     if (result[0]) {
// //       console.log('First result day:', result[0].date, 'doses:', result[0].doses.length);
// //     }
// //     return result.sort((a, b) => b.date.localeCompare(a.date));
// //   };
// //         doses,
// //         adherenceRate
// //       });
// //     });
// //         doses,
// //         adherenceRate
// //       });
// //     });
    
// //     // Sort by date (most recent first)
// //     console.log('generateDailyDoses result:', result.length, 'days');
// //     if (result[0]) {
// //       console.log('First result day:', result[0].date, 'doses:', result[0].doses.length);
// //     }
// //     return result.sort((a, b) => b.date.localeCompare(a.date));
// //   };

// //   const getAdherenceColor = (rate: number) => {
// //     if (rate >= 80) return theme.success;
// //     if (rate >= 50) return theme.warning;
// //     return theme.error;
// //   };

// //   const getAdherenceText = (rate: number) => {
// //     if (rate >= 80) return 'Excellent';
// //     if (rate >= 60) return 'Good';
// //     if (rate >= 40) return 'Fair';
// //     return 'Poor';
// //   };
  
// //   const handleExportData = async () => {
// //     try {
// //       setIsExporting(true);
// //       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
// //       // Get current user ID
// //       const userId = (await account.get()).$id;
      
// //       const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
      
// //       const [medicines, reminderHistory] = await Promise.all([
// //         getUserMedicines(true),
// //         getReminderHistory(userId, startDate, endDate),
// //       ]);
      
// //       // Get the friendly name for the timerange for the filename
// //       const timeRangeLabel = timeRange === 'week' ? 'last_7_days' : 
// //                             timeRange === 'month' ? 'last_30_days' : 'last_365_days';
                            
// //       // Convert to old format for export compatibility
// //       const medicationsForExport = medicines.map((med: any) => ({
// //         id: med.medicineId,
// //         name: med.medicineName,
// //         color: med.color || '#3498db',
// //         times: med.times,
// //         dosage: med.dosage,
// //         frequency: med.frequency,
// //         startDate: med.startDate,
// //         endDate: med.endDate,
// //         isActive: med.isActive,
// //         duration: med.duration || 0,
// //         reminderEnabled: med.reminderEnabled,
// //         currentSupply: med.currentSupply || 0,
// //         totalSupply: med.totalSupply || 0,
// //         refillReminder: med.refillReminder || false,
// //         refillAt: med.refillAt || 0
// //       }));
      
// //       const doseHistoryForExport = reminderHistory.map((reminder: any) => ({
// //         id: reminder.reminderId,
// //         medicationId: reminder.medicineId,
// //         timeTaken: reminder.actualTime,
// //         scheduledTime: reminder.scheduledTime,
// //         status: reminder.status,
// //         timestamp: reminder.actualTime || reminder.scheduledTime,
// //         taken: reminder.status === 'taken'
// //       }));
                            
// //       await exportAdherenceReport(medicationsForExport, doseHistoryForExport, startDate, endDate, timeRangeLabel);
// //     } catch (error) {
// //       console.error('Error exporting data:', error);
// //       Alert.alert('Export Error', 'Failed to export adherence data');
// //     } finally {
// //       setIsExporting(false);
// //     }
// //   };

// //   const formatDisplayDate = (dateString: string) => {
// //     const date = new Date(dateString);
// //     return date.toLocaleDateString('en-US', { 
// //       weekday: 'short', 
// //       month: 'short', 
// //       day: 'numeric' 
// //     });
// //   };

// //   const DailyDoseCard = ({ data }: { data: DailyDoses }) => {
    
// //     // Helper method to render medication frequency information
// //     const renderMedicationFrequencyHeader = (doses: DailyDose[]) => {
// //       if (doses.length === 0 || !doses[0].frequency) return null;
      
// //       const takenCount = doses.filter(d => d.wasTaken).length;
// //       const totalDosesPerDay = doses[0].frequency;
      
// //       // Format text based on the frequency
// //       const frequencyText = formatFrequencyText(totalDosesPerDay);
      
// //       return (
// //         <View style={[styles.medicationFrequencyHeader, { backgroundColor: theme.border + '20' }]}>
// //           <Text style={[styles.medicationFrequencyText, { color: theme.textSecondary }]}>
// //             {doses[0].medicationName} - {frequencyText} - Taken {takenCount} of {totalDosesPerDay} {totalDosesPerDay === 1 ? 'daily dose' : 'daily doses'}
// //           </Text>
// //         </View>
// //       );
// //     };
    
// //     return (
// //       <View 
// //         style={[
// //           styles.dailyDoseCard, 
// //           { backgroundColor: theme.card, ...shadow.small }
// //         ]}
// //       >
// //         <View style={commonStyles.rowBetween}>
// //           <Text style={[styles.dateHeader, { color: theme.text }]}>
// //             {formatDisplayDate(data.date)}
// //           </Text>
// //           <View style={[
// //             styles.adherenceBadge,
// //             { backgroundColor: getAdherenceColor(data.adherenceRate) + '20' }
// //           ]}>
// //             <Text style={[
// //               styles.adherenceBadgeText,
// //               { color: getAdherenceColor(data.adherenceRate) }
// //             ]}>
// //               {Math.round(data.adherenceRate)}%
// //             </Text>
// //           </View>
// //         </View>
        
// //         <View style={[styles.doseDivider, { backgroundColor: theme.border + '30' }]} />
        
// //         {data.doses.length === 0 ? (
// //           <Text style={[styles.noDosesText, { color: theme.textSecondary }]}>
// //             No scheduled doses for this day
// //           </Text>
// //         ) : (
// //           (() => {
// //             // Group doses by medication ID for better organization
// //             const medicationGroups: {[key: string]: typeof data.doses} = {};
// //             data.doses.forEach(dose => {
// //               if (!medicationGroups[dose.medicationId]) {
// //                 medicationGroups[dose.medicationId] = [];
// //               }
// //               medicationGroups[dose.medicationId].push(dose);
// //             });
            
// //             // Render each group
// //             return Object.entries(medicationGroups).map(([medId, doses]) => (
// //               <View key={medId} style={styles.medicationGroup}>
// //                 {/* Render frequency info for all medications, including once-daily */}
// //                 {renderMedicationFrequencyHeader(doses)}
// //                 {doses.map((dose, index) => (
// //                   <View key={`${dose.medicationId}_${dose.scheduledTime}`} style={styles.doseItem}>
// //                     <View 
// //                       style={[
// //                         styles.doseColorIndicator, 
// //                         { backgroundColor: dose.color }
// //                       ]} 
// //                     />
// //                     <View style={styles.doseDetails}>
// //                       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// //                         <Text style={[styles.doseMedName, { color: theme.text }]}>
// //                           {dose.medicationName}
// //                         </Text>
// //                         {dose.frequency && (
// //                           <View style={[
// //                             styles.frequencyBadge, 
// //                             { backgroundColor: dose.color + '20', marginLeft: spacing.sm }
// //                           ]}>
// //                             <Text style={[
// //                               styles.frequencyBadgeText, 
// //                               { color: dose.color }
// //                             ]}>
// //                               {formatFrequencyText(dose.frequency)}
// //                             </Text>
// //                           </View>
// //                         )}
// //                       </View>
// //                       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// //                         <Text style={[styles.doseTimeLabel, { color: theme.textSecondary }]}>
// //                           Scheduled: 
// //                         </Text>
// //                         <Text style={[styles.doseTime, { color: theme.text }]}>
// //                           {dose.scheduledTime}
// //                         </Text>
// //                       </View>
// //                     </View>
// //                     <View style={styles.doseStatus}>
// //                       {dose.wasTaken ? (
// //                         <View style={styles.takenContainer}>
// //                           <Ionicons 
// //                             name="checkmark-circle" 
// //                             size={18} 
// //                             color={theme.success} 
// //                             style={styles.statusIcon}
// //                           />
// //                           <View>
// //                             <Text style={[styles.statusText, { color: theme.success }]}>Taken</Text>
// //                             <Text style={[styles.takenTime, { color: theme.textSecondary }]}>
// //                               {dose.timeTaken}
// //                               {dose.delay !== undefined && dose.delay > 15 && (
// //                                 <Text style={[styles.delayText, { color: theme.warning }]}>
// //                                   {' '}(+{Math.round(dose.delay)}m)
// //                                 </Text>
// //                               )}
// //                             </Text>
// //                           </View>
// //                         </View>
// //                       ) : (
// //                         <View style={styles.missedContainer}>
// //                           <Ionicons 
// //                             name="close-circle" 
// //                             size={18} 
// //                             color={theme.error} 
// //                             style={styles.statusIcon}
// //                           />
// //                           <Text style={[styles.statusText, { color: theme.error }]}>
// //                             Missed
// //                           </Text>
// //                         </View>
// //                       )}
// //                     </View>
                    
// //                     {index < doses.length - 1 && (
// //                       <View 
// //                         style={[
// //                           styles.doseDivider, 
// //                           { backgroundColor: theme.border + '30', marginLeft: spacing.lg }
// //                         ]} 
// //                       />
// //                     )}
// //                   </View>
// //                 ))}
// //               </View>
// //             ));
// //           })()
// //         )}
// //       </View>
// //     );
// //   };

// //   return (
// //     <View style={commonStyles.container}>
// //       <Header
// //         title="Medication Stats"
// //         onBack={() => router.back()}
// //         rightComponent={
// //           <TouchableOpacity 
// //             onPress={handleExportData}
// //             style={[
// //               styles.exportButton,
// //               { backgroundColor: theme.tertiary + '20' }
// //             ]}
// //             disabled={isExporting || isLoading}
// //           >
// //             {isExporting ? (
// //               <ActivityIndicator size="small" color={theme.tertiary} />
// //             ) : (
// //               <>
// //                 <Ionicons name="download-outline" size={16} color={"white"} />
// //                 <Text style={[styles.exportText, { color: "white" }]}>Export CSV</Text>
// //               </>
// //             )}
// //           </TouchableOpacity>
// //         }
// //       />

// //       <ScrollView 
// //         style={styles.content}
// //         showsVerticalScrollIndicator={false}
// //         contentContainerStyle={styles.scrollContent}
// //       >
// //         {isLoading ? (
// //           <View style={styles.loadingContainer}>
// //             <ActivityIndicator size="large" color={theme.primary} />
// //             <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
// //               Loading statistics...
// //             </Text>
// //           </View>
// //         ) : (
// //           <>
// //             {/* Time range selector */}
// //             <View style={styles.timeRangeContainer}>
// //               <TouchableOpacity
// //                 style={[
// //                   styles.timeRangeButton,
// //                   timeRange === 'week' && styles.timeRangeButtonActive,
// //                   { borderColor: theme.border },
// //                   timeRange === 'week' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
// //                 ]}
// //                 onPress={() => setTimeRange('week')}
// //               >
// //                 <Text
// //                   style={[
// //                     styles.timeRangeText,
// //                     { color: theme.text },
// //                     timeRange === 'week' && { color: theme.primary, fontWeight: 'bold' },
// //                   ]}
// //                 >
// //                   7 Days
// //                 </Text>
// //               </TouchableOpacity>
              
// //               <TouchableOpacity
// //                 style={[
// //                   styles.timeRangeButton,
// //                   timeRange === 'month' && styles.timeRangeButtonActive,
// //                   { borderColor: theme.border },
// //                   timeRange === 'month' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
// //                 ]}
// //                 onPress={() => setTimeRange('month')}
// //               >
// //                 <Text
// //                   style={[
// //                     styles.timeRangeText,
// //                     { color: theme.text },
// //                     timeRange === 'month' && { color: theme.primary, fontWeight: 'bold' },
// //                   ]}
// //                 >
// //                   30 Days
// //                 </Text>
// //               </TouchableOpacity>
              
// //               <TouchableOpacity
// //                 style={[
// //                   styles.timeRangeButton,
// //                   timeRange === 'year' && styles.timeRangeButtonActive,
// //                   { borderColor: theme.border },
// //                   timeRange === 'year' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
// //                 ]}
// //                 onPress={() => setTimeRange('year')}
// //               >
// //                 <Text
// //                   style={[
// //                     styles.timeRangeText,
// //                     { color: theme.text },
// //                     timeRange === 'year' && { color: theme.primary, fontWeight: 'bold' },
// //                   ]}
// //                 >
// //                   365 Days
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
            
// //             {/* Overall adherence card */}
// //             <View style={[
// //               styles.overallCard, 
// //               { backgroundColor: theme.card, ...shadow.medium }
// //             ]}>
// //               <Text style={[styles.overallTitle, { color: theme.text }]}>
// //                 Overall Adherence
// //               </Text>
              
// //               <View style={styles.adherenceDisplay}>
// //                 <View style={[
// //                   styles.adherenceCircle, 
// //                   { borderColor: getAdherenceColor(overallAdherence) }
// //                 ]}>
// //                   <Text style={[
// //                     styles.adherenceRate, 
// //                     { color: getAdherenceColor(overallAdherence) }
// //                   ]}>
// //                     {Math.round(overallAdherence)}%
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.adherenceTextContainer}>
// //                   <Text style={[styles.adherenceLabel, { color: theme.text }]}>
// //                     {getAdherenceText(overallAdherence)}
// //                   </Text>
// //                   <Text style={[styles.adherenceDescription, { color: theme.textSecondary }]}>
// //                     {Math.round(overallAdherence) >= 80 
// //                       ? 'Great job keeping up with your medications!' 
// //                       : 'Try to improve your medication adherence.'}
// //                   </Text>
// //                 </View>
// //               </View>
// //             </View>
            
// //             {/* Adherence trend chart */}
// //             {adherenceTrend.length > 0 && (
// //               <View style={[
// //                 styles.trendCard,
// //                 { backgroundColor: theme.card, ...shadow.small }
// //               ]}>
// //                 <Text style={[styles.sectionTitle, { color: theme.text }]}>
// //                   Adherence Trend
// //                 </Text>
// //                 <View style={styles.chartContainer}>
// //                   {renderAdherenceTrendChart()}
// //                 </View>
// //               </View>
// //             )}

// //             {/* Medication Details Section */}
// //             <Text style={[styles.sectionTitle, { color: theme.text }]}>
// //               Medication Details
// //             </Text>
            
// //             {stats.length > 0 ? (
// //               stats.map(stat => (
// //                 <View 
// //                   key={stat.id}
// //                   style={[
// //                     styles.statCard, 
// //                     { backgroundColor: theme.card, ...shadow.small }
// //                   ]}
// //                 >
// //                   <View style={commonStyles.rowBetween}>
// //                     <Text style={[styles.medicationName, { color: theme.text }]}>
// //                       {stat.name}
// //                     </Text>
// //                     <View style={[
// //                       styles.adherenceBadge,
// //                       { backgroundColor: getAdherenceColor(stat.adherenceRate) + '20' }
// //                     ]}>
// //                       <Text style={[
// //                         styles.adherenceBadgeText,
// //                         { color: getAdherenceColor(stat.adherenceRate) }
// //                       ]}>
// //                         {Math.round(stat.adherenceRate)}%
// //                       </Text>
// //                     </View>
// //                   </View>
                  
// //                   <View style={[
// //                     styles.progressContainer, 
// //                     { backgroundColor: theme.border + '40' }
// //                   ]}>
// //                     <View 
// //                       style={[
// //                         styles.progressBar,
// //                         { 
// //                           backgroundColor: getAdherenceColor(stat.adherenceRate),
// //                           width: `${Math.min(100, stat.adherenceRate)}%` 
// //                         }
// //                       ]}
// //                     />
// //                   </View>
                  
// //                   <View style={commonStyles.rowBetween}>
// //                     <Text style={[styles.doseInfo, { color: theme.textSecondary }]}>
// //                       Taken: {stat.takenDoses} of {stat.totalDoses} doses ({Math.floor(stat.takenDoses / stat.dosesPerDay)} of {Math.floor(stat.totalDoses / stat.dosesPerDay)} days)
// //                     </Text>
// //                     <Text style={[styles.missedInfo, { color: theme.textSecondary }]}>
// //                       Missed: {stat.missedDoses}
// //                     </Text>
// //                   </View>
// //                   <Text style={[styles.frequencyInfo, { color: theme.textTertiary, marginTop: 4 }]}>
// //                     {formatFrequencyText(stat.dosesPerDay)}
// //                   </Text>
// //                 </View>
// //               ))
// //             ) : (
// //               <View style={styles.emptyState}>
// //                 <Ionicons name="stats-chart" size={64} color={theme.textTertiary} />
// //                 <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
// //                   No medication data yet
// //                 </Text>
// //                 <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
// //                   Start tracking your medications to see adherence statistics
// //                 </Text>
// //                 <Button
// //                   title="Add Medication"
// //                   onPress={() => router.push('/medications/add')}
// //                   variant="primary"
// //                   icon="add-circle-outline"
// //                   style={{ marginTop: spacing.lg }}
// //                 />
// //               </View>
// //             )}
            
// //             {/* Daily Doses Section */}
// //             {dailyDoses.length > 0 && (
// //               <View style={{ marginTop: spacing.xl }}>
// //                 <Text style={[styles.sectionTitle, { color: theme.text }]}>
// //                   Daily Medication Doses
// //                 </Text>
// //                 <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
// //                   Track your doses taken each day
// //                 </Text>
                
// //                 {dailyDoses.map(dailyDose => (
// //                   <DailyDoseCard key={dailyDose.date} data={dailyDose} />
// //                 ))}
// //               </View>
// //             )}
            
// //             <View style={styles.footer}>
// //               <Text style={[styles.statDisclaimer, { color: theme.textTertiary }]}>
// //                 * Statistics are based on scheduled doses and your medication tracking history.
// //               </Text>
// //             </View>
// //           </>
// //         )}
// //       </ScrollView>
// //     </View>
// //   );
// // }



// // const styles = StyleSheet.create({
// //   content: {
// //     flex: 1,
// //   },
// //   scrollContent: {
// //     padding: spacing.md,
// //   },
// //   timeRangeContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     marginBottom: spacing.md,
// //   },
// //   timeRangeButton: {
// //     paddingHorizontal: spacing.md,
// //     paddingVertical: spacing.xs,
// //     borderRadius: borderRadius.pill,
// //     marginHorizontal: spacing.xs,
// //     borderWidth: 1,
// //   },
// //   timeRangeButtonActive: {
// //     borderWidth: 1,
// //   },
// //   timeRangeText: {
// //     ...typography.body,
// //   },
// //   overallCard: {
// //     borderRadius: borderRadius.large,
// //     padding: spacing.lg,
// //     marginBottom: spacing.lg,
// //   },
// //   overallTitle: {
// //     ...typography.subheader,
// //     marginBottom: spacing.md,
// //     textAlign: 'center',
// //   },
// //   adherenceDisplay: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-around',
// //   },
// //   adherenceCircle: {
// //     width: 80,
// //     height: 80,
// //     borderRadius: 40,
// //     borderWidth: 3,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   adherenceRate: {
// //     ...typography.header,
// //     fontWeight: 'bold',
// //   },
// //   adherenceTextContainer: {
// //     flex: 1,
// //     marginLeft: spacing.lg,
// //   },
// //   adherenceLabel: {
// //     ...typography.subheader,
// //     marginBottom: spacing.xs,
// //   },
// //   adherenceDescription: {
// //     ...typography.body,
// //   },
// //   sectionTitle: {
// //     ...typography.subheader,
// //     marginBottom: spacing.md,
// //   },
// //   statCard: {
// //     borderRadius: borderRadius.medium,
// //     padding: spacing.md,
// //     marginBottom: spacing.md,
// //   },
// //   medicationName: {
// //     ...typography.title,
// //     flex: 1,
// //     marginBottom: spacing.sm,
// //   },
// //   adherenceBadge: {
// //     paddingHorizontal: spacing.sm,
// //     paddingVertical: spacing.xs / 2,
// //     borderRadius: borderRadius.pill,
// //   },
// //   adherenceBadgeText: {
// //     ...typography.caption,
// //     fontWeight: 'bold',
// //   },
// //   progressContainer: {
// //     height: 8,
// //     borderRadius: 4,
// //     marginVertical: spacing.sm,
// //     overflow: 'hidden',
// //   },
// //   progressBar: {
// //     height: '100%',
// //   },
// //   doseInfo: {
// //     ...typography.caption,
// //   },
// //   missedInfo: {
// //     ...typography.caption,
// //   },
// //   frequencyInfo: {
// //     ...typography.caption,
// //     fontSize: typography.caption.fontSize - 1,
// //   },
// //   frequencyBadge: {
// //     paddingHorizontal: spacing.xs,
// //     paddingVertical: 2,
// //     borderRadius: borderRadius.pill,
// //   },
// //   frequencyBadgeText: {
// //     fontSize: typography.caption.fontSize - 2,
// //     fontWeight: '600',
// //   },
// //   medicationGroup: {
// //     marginBottom: spacing.md,
// //   },
// //   medicationFrequencyHeader: {
// //     borderRadius: borderRadius.small,
// //     paddingVertical: spacing.xs,
// //     paddingHorizontal: spacing.sm,
// //     marginBottom: spacing.sm,
// //     marginTop: spacing.xs,
// //   },
// //   medicationFrequencyText: {
// //     ...typography.caption,
// //     fontWeight: '600',
// //   },
// //   emptyState: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     padding: spacing.xl,
// //   },
// //   emptyStateText: {
// //     ...typography.subheader,
// //     marginTop: spacing.md,
// //     marginBottom: spacing.xs,
// //   },
// //   emptyStateSubtext: {
// //     ...typography.body,
// //     textAlign: 'center',
// //     marginBottom: spacing.md,
// //   },
// //   footer: {
// //     marginVertical: spacing.lg,
// //   },
// //   statDisclaimer: {
// //     ...typography.caption,
// //     textAlign: 'center',
// //   },
// //   // New styles
// //   exportButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: spacing.md,
// //     paddingVertical: spacing.xs,
// //     borderRadius: borderRadius.pill,
// //     marginRight: spacing.xs,
// //   },
// //   exportText: {
// //     fontSize: typography.caption.fontSize,
// //     fontWeight: '600',
// //     marginLeft: spacing.xs,
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   loadingText: {
// //     ...typography.body,
// //     marginTop: spacing.md,
// //   },
// //   trendCard: {
// //     borderRadius: borderRadius.large,
// //     padding: spacing.md,
// //     marginBottom: spacing.lg,
// //   },
// //   chartContainer: {
// //     marginTop: spacing.sm,
// //     alignItems: 'center',
// //   },
// //   chartLabel: {
// //     ...typography.caption,
// //     marginTop: spacing.xs,
// //   },
// //   detailedStatsContainer: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     justifyContent: 'space-between',
// //     marginTop: spacing.md,
// //   },
// //   statBox: {
// //     width: '48%',
// //     backgroundColor: 'rgba(0,0,0,0.03)',
// //     padding: spacing.md,
// //     borderRadius: borderRadius.medium,
// //     marginBottom: spacing.sm,
// //   },
// //   statBoxValue: {
// //     ...typography.subheader,
// //     fontWeight: 'bold',
// //   },
// //   statBoxLabel: {
// //     ...typography.caption,
// //   },
// //   // Daily dose styles
// //   dailyDoseCard: {
// //     borderRadius: borderRadius.medium,
// //     padding: spacing.md,
// //     marginBottom: spacing.md,
// //   },
// //   dateHeader: {
// //     ...typography.title,
// //     marginBottom: spacing.xs,
// //   },
// //   doseDivider: {
// //     height: 1,
// //     width: '100%',
// //     marginVertical: spacing.sm,
// //   },
// //   noDosesText: {
// //     ...typography.body,
// //     textAlign: 'center',
// //     marginVertical: spacing.md,
// //   },
// //   doseItem: {
// //     marginVertical: spacing.xs,
// //   },
// //   doseColorIndicator: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     position: 'absolute',
// //     top: spacing.sm,
// //     left: 0,
// //   },
// //   doseDetails: {
// //     paddingLeft: spacing.md,
// //     marginBottom: spacing.xs,
// //   },
// //   doseMedName: {
// //     ...typography.body,
// //     fontWeight: '600',
// //   },
// //   doseTimeLabel: {
// //     ...typography.caption,
// //     marginRight: spacing.xs,
// //   },
// //   doseTime: {
// //     ...typography.caption,
// //     fontWeight: '500',
// //   },
// //   doseStatus: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingLeft: spacing.md,
// //   },
// //   takenContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   missedContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //   },
// //   statusIcon: {
// //     marginRight: spacing.xs,
// //   },
// //   statusText: {
// //     ...typography.caption,
// //     fontWeight: '600',
// //   },
// //   takenTime: {
// //     ...typography.caption,
// //   },
// //   delayText: {
// //     ...typography.caption,
// //     fontWeight: '600',
// //   },
// //   sectionDescription: {
// //     ...typography.body,
// //     marginTop: -spacing.sm,
// //     marginBottom: spacing.md,
// //   },
// // });























// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useTheme } from '../../utils/ThemeContext';
// import { getUserMedicines } from '../../services/medicationService';
// import { getReminderHistory, getAdherenceStats } from '../../services/doseHistoryService';
// import { account } from '../../services/appwrite';
// import { Medicine } from '../../services/collections';
// import { borderRadius, createCommonStyles, shadow, spacing, typography } from '../../utils/StyleSystem';
// import Header from '../../components/Header';
// import Button from '../../components/Button';
// import { LinearGradient } from 'expo-linear-gradient';
// import Svg, { Path, Circle, Line } from 'react-native-svg';
// import * as Haptics from 'expo-haptics';
// import { 
//   exportAdherenceReport, 
//   MedicationAdherenceData
// } from '../../utils/exportData';

// const { width } = Dimensions.get('window');
// const BAR_HEIGHT = 180;

// interface MedicationStat {
//   id: string;
//   name: string;
//   color: string;
//   totalDoses: number;
//   takenDoses: number;
//   missedDoses: number;
//   adherenceRate: number;
//   onTimeDoses: number;
//   lateDoses: number;
//   averageDelay: number;
//   dosesPerDay: number;
// }

// interface AdherenceTrend {
//   date: string;
//   adherenceRate: number;
// }

// interface DailyDose {
//   medicationId: string;
//   medicationName: string;
//   color: string;
//   scheduledTime: string;
//   wasTaken: boolean;
//   timeTaken?: string;
//   delay?: number;
//   frequency?: number;
// }

// interface DailyDoses {
//   date: string;
//   doses: DailyDose[];
//   adherenceRate: number;
// }

// export default function StatsScreen() {
//   const router = useRouter();
//   const { theme, isDark } = useTheme();
//   const [stats, setStats] = useState<MedicationStat[]>([]);
//   const [overallAdherence, setOverallAdherence] = useState(0);
//   const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
//   const [adherenceTrend, setAdherenceTrend] = useState<AdherenceTrend[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);
//   const [dailyDoses, setDailyDoses] = useState<DailyDoses[]>([]);
//   const commonStyles = createCommonStyles(theme);
  
//   // Helper function to format frequency text consistently
//   const formatFrequencyText = (frequency: number): string => {
//     if (frequency === 1) return 'Once daily';
//     if (frequency === 2) return 'Twice daily';
//     if (frequency === 3) return 'Three times daily';
//     if (frequency === 4) return 'Four times daily';
//     return `${frequency} times daily`;
//   };

//   // Helper function to generate expected doses for a medication on a given date
//   const generateExpectedDoses = (medication: any, date: Date): DailyDose[] => {
//     const expectedDoses: DailyDose[] = [];
    
//     // Check if medication is active on this date
//     const medicationStartDate = new Date(medication.startDate);
//     const medicationEndDate = medication.endDate ? new Date(medication.endDate) : null;
    
//     // Skip if date is before medication start or after medication end
//     if (date < medicationStartDate) return expectedDoses;
//     if (medicationEndDate && date > medicationEndDate) return expectedDoses;
    
//     // Generate doses based on medication times
//     medication.times.forEach((time: string) => {
//       expectedDoses.push({
//         medicationId: medication.medicineId,
//         medicationName: medication.medicineName,
//         color: medication.color || '#3498db',
//         scheduledTime: time,
//         wasTaken: false, // Default to not taken
//         frequency: medication.times.length
//       });
//     });
    
//     return expectedDoses;
//   };

//   // Function to render the adherence trend chart
//   const renderAdherenceTrendChart = () => {
//     if (adherenceTrend.length === 0) return null;
    
//     const chartHeight = 150;
//     const chartWidth = width - spacing.md * 4;
//     const chartPadding = 20;
//     const usableHeight = chartHeight - chartPadding * 2;
//     const usableWidth = chartWidth - chartPadding * 2;
    
//     const xStep = usableWidth / Math.max(adherenceTrend.length - 1, 1);
    
//     // Generate path for the trend line
//     let pathD = '';
//     const points = adherenceTrend.map((item, index) => {
//       const x = chartPadding + index * xStep;
//       const y = chartPadding + usableHeight - (usableHeight * Math.min(item.adherenceRate, 100) / 100);
      
//       if (index === 0) {
//         pathD = `M ${x},${y}`;
//       } else {
//         pathD += ` L ${x},${y}`;
//       }
      
//       return { x, y, adherenceRate: item.adherenceRate };
//     });

//     return (
//       <Svg height={chartHeight} width="100%" style={{ marginTop: spacing.md }}>
//         {/* Chart grid lines */}
//         <Line 
//           x1={chartPadding} 
//           y1={chartPadding} 
//           x2={chartPadding} 
//           y2={chartHeight - chartPadding}
//           stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
//           strokeWidth="1"
//         />
//         <Line 
//           x1={chartPadding} 
//           y1={chartHeight - chartPadding} 
//           x2={chartWidth - chartPadding} 
//           y2={chartHeight - chartPadding}
//           stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
//           strokeWidth="1"
//         />
        
//         {/* 50% line */}
//         <Line 
//           x1={chartPadding} 
//           y1={chartPadding + usableHeight/2} 
//           x2={chartWidth - chartPadding} 
//           y2={chartPadding + usableHeight/2}
//           stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
//           strokeWidth="1"
//           strokeDasharray="5,5"
//         />
        
//         {/* Trend line */}
//         <Path
//           d={pathD}
//           stroke={theme.primary}
//           strokeWidth="2"
//           fill="none"
//         />
        
//         {/* Data points */}
//         {points.map((point, index) => (
//           <Circle
//             key={index}
//             cx={point.x}
//             cy={point.y}
//             r="3"
//             fill={getAdherenceColor(point.adherenceRate)}
//             stroke="white"
//             strokeWidth="1"
//           />
//         ))}
//       </Svg>
//     );
//   };

//   useEffect(() => {
//     loadStats();
//   }, [timeRange]);

//   // Reload stats when screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       loadStats();
//     }, [timeRange])
//   );

//   // Helper function to process reminder history into adherence data format
//   const processReminderHistoryToAdherenceData = (medicines: any[], reminderHistory: any[], startDate: Date, endDate: Date): MedicationAdherenceData[] => {
//     const adherenceData: MedicationAdherenceData[] = [];
    
//     // Create a map for quick medicine lookup
//     const medicineMap = new Map<string, any>();
//     medicines.forEach(medicine => {
//       medicineMap.set(medicine.medicineId, medicine);
//     });
    
//     // Process each reminder
//     reminderHistory.forEach(reminder => {
//       const medicine = medicineMap.get(reminder.medicineId);
//       if (!medicine) return;
      
//       const scheduledTime = new Date(reminder.scheduledTime);
//       const date = scheduledTime.toISOString().split('T')[0];
      
//       // Calculate delay if taken
//       let delay = 0;
//       if (reminder.status === 'taken' && reminder.actualTime) {
//         const actualTime = new Date(reminder.actualTime);
//         delay = Math.max(0, (actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
//       }
      
//       adherenceData.push({
//         medicationId: reminder.medicineId,
//         medicationName: medicine.medicineName,
//         date: date,
//         scheduledTime: scheduledTime.toTimeString().slice(0, 5),
//         wasTaken: reminder.status === 'taken',
//         timeTaken: reminder.actualTime ? new Date(reminder.actualTime).toTimeString().slice(0, 5) : undefined,
//         delay: reminder.status === 'taken' ? delay : undefined
//       });
//     });
    
//     return adherenceData;
//   };

//   const loadStats = async () => {
//     try {
//       setIsLoading(true);
      
//       // Get current user ID
//       const userId = (await account.get()).$id;
      
//       // Get date range based on selected time range
//       const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
      
//       // Fetch data from Appwrite services
//       const [medicines, reminderHistory] = await Promise.all([
//         getUserMedicines(true), // Only active medicines
//         getReminderHistory(userId, startDate, endDate),
//       ]);

//       console.log('=== STATS DEBUG: Loaded raw data ===');
//       console.log('Medicines count:', medicines.length);
//       console.log('Reminder history count:', reminderHistory.length);
//       console.log('Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
      
//       // Process adherence data
//       const processedAdherenceData = processReminderHistoryToAdherenceData(medicines, reminderHistory, startDate, endDate);
      
//       // Generate comprehensive daily doses data that includes all expected doses
//       const dailyDosesData = generateComprehensiveDailyDoses(medicines, reminderHistory, startDate, endDate);
//       setDailyDoses(dailyDosesData);
      
//       // Generate adherence trend
//       const trendData = generateAdherenceTrend(dailyDosesData);
//       setAdherenceTrend(trendData);

//       // Calculate stats for each medication using comprehensive data
//       const medicationStats: MedicationStat[] = medicines.map((medication: any) => {
//         let totalDoses = 0;
//         let takenDoses = 0;
//         let onTimeDoses = 0;
//         let lateDoses = 0;
//         let delaySum = 0;
//         let delayCount = 0;
        
//         // Calculate stats from daily doses data
//         dailyDosesData.forEach(dailyData => {
//           const medicationDoses = dailyData.doses.filter(dose => dose.medicationId === medication.medicineId);
          
//           medicationDoses.forEach(dose => {
//             totalDoses++;
//             if (dose.wasTaken) {
//               takenDoses++;
//               if (dose.delay !== undefined) {
//                 if (dose.delay <= 30) {
//                   onTimeDoses++;
//                 } else {
//                   lateDoses++;
//                 }
//                 delaySum += dose.delay;
//                 delayCount++;
//               }
//             }
//           });
//         });
        
//         const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
//         const averageDelay = delayCount > 0 ? delaySum / delayCount : 0;
//         const missedDoses = totalDoses - takenDoses;
        
//         return {
//           id: medication.medicineId,
//           name: medication.medicineName,
//           color: medication.color || '#3498db',
//           totalDoses: totalDoses,
//           takenDoses: takenDoses,
//           missedDoses: missedDoses,
//           adherenceRate: adherenceRate,
//           onTimeDoses: onTimeDoses,
//           lateDoses: lateDoses,
//           averageDelay: averageDelay,
//           dosesPerDay: medication.times.length,
//         };
//       }).filter((stat: any) => stat.totalDoses > 0);
      
//       // Sort by adherence rate (highest first)
//       medicationStats.sort((a, b) => b.adherenceRate - a.adherenceRate);
      
//       // Calculate overall adherence
//       const totalExpectedDoses = medicationStats.reduce((sum, stat) => sum + stat.totalDoses, 0);
//       const totalTakenDoses = medicationStats.reduce((sum, stat) => sum + stat.takenDoses, 0);
//       const overall = totalExpectedDoses > 0 ? (totalTakenDoses / totalExpectedDoses) * 100 : 0;
      
//       setStats(medicationStats);
//       setOverallAdherence(overall);
      
//     } catch (error) {
//       console.error('Error loading stats:', error);
//       Alert.alert('Error', 'Failed to load medication statistics');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // const getDateRangeFromTimeRange = (range: 'week' | 'month' | 'year') => {
//   //   const now = new Date();
//   //   const endDate = new Date(now);
//   //   endDate.setHours(23, 59, 59, 999);
    
//   //   const startDate = new Date(now);
//   //   startDate.setHours(0, 0, 0, 0);
    
//   //   switch (range) {
//   //     case 'week':
//   //       startDate.setDate(now.getDate() - 6);
//   //       break;
//   //     case 'month':
//   //       startDate.setDate(now.getDate() - 29);
//   //       break;
//   //     case 'year':
//   //       startDate.setDate(now.getDate() - 364);
//   //       break;
//   //   }
    
//   //   return { startDate, endDate };
//   // };

//   const getDateRangeFromTimeRange = (range: 'week' | 'month' | 'year') => {
//   const now = new Date();
//   const endDate = new Date(now);
//   endDate.setHours(23, 59, 59, 999); // End of today
  
//   const startDate = new Date(now);
//   startDate.setHours(0, 0, 0, 0); // Start of today
  
//   switch (range) {
//     case 'week':
//       // Show last 7 days INCLUDING today (today + 6 previous days)
//       startDate.setDate(now.getDate() - 6); // Go back 6 days from today
//       break;
//     case 'month':
//       // Show last 30 days INCLUDING today (today + 29 previous days)
//       startDate.setDate(now.getDate() - 29); // Go back 29 days from today
//       break;
//     case 'year':
//       // Show last 365 days INCLUDING today (today + 364 previous days)
//       startDate.setDate(now.getDate() - 364); // Go back 364 days from today
//       break;
//   }
  
//   return { startDate, endDate };
// };



//   const generateAdherenceTrend = (dailyDosesData: DailyDoses[]): AdherenceTrend[] => {
//     return dailyDosesData.map(dailyData => ({
//       date: dailyData.date,
//       adherenceRate: dailyData.adherenceRate
//     })).sort((a, b) => a.date.localeCompare(b.date));
//   };

//   const generateComprehensiveDailyDoses = (medicines: any[], reminderHistory: any[], startDate: Date, endDate: Date): DailyDoses[] => {
//     const result: DailyDoses[] = [];
//     const dayMilliseconds = 24 * 60 * 60 * 1000;
    
//     // Create reminder lookup map
//     const reminderMap = new Map<string, any>();
//     reminderHistory.forEach(reminder => {
//       const scheduledTime = new Date(reminder.scheduledTime);
//       const date = scheduledTime.toISOString().split('T')[0];
//       const time = scheduledTime.toTimeString().slice(0, 5);
//       const key = `${reminder.medicineId}_${date}_${time}`;
//       reminderMap.set(key, reminder);
//     });
    
//     // Generate data for each date in range
//     for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMilliseconds)) {
//       const dateStr = d.toISOString().split('T')[0];
//       const doses: DailyDose[] = [];
      
//       // For each active medication, generate expected doses
//       medicines.forEach(medication => {
//         const expectedDoses = generateExpectedDoses(medication, d);
        
//         expectedDoses.forEach(expectedDose => {
//           const reminderKey = `${medication.medicineId}_${dateStr}_${expectedDose.scheduledTime}`;
//           const reminder = reminderMap.get(reminderKey);
          
//           if (reminder) {
//             // Found actual reminder data
//             let delay = 0;
//             if (reminder.status === 'taken' && reminder.actualTime) {
//               const scheduledDateTime = new Date(`${dateStr}T${expectedDose.scheduledTime}`);
//               const actualTime = new Date(reminder.actualTime);
//               delay = Math.max(0, (actualTime.getTime() - scheduledDateTime.getTime()) / (1000 * 60));
//             }
            
//             doses.push({
//               ...expectedDose,
//               wasTaken: reminder.status === 'taken',
//               timeTaken: reminder.actualTime ? new Date(reminder.actualTime).toTimeString().slice(0, 5) : undefined,
//               delay: reminder.status === 'taken' ? delay : undefined
//             });
//           } else {
//             // No reminder data, dose was missed
//             doses.push(expectedDose);
//           }
//         });
//       });
      
//       // Calculate adherence rate for the day
//       const totalDoses = doses.length;
//       const takenDoses = doses.filter(dose => dose.wasTaken).length;
//       const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
      
//       result.push({
//         date: dateStr,
//         doses,
//         adherenceRate
//       });
//     }
    
//     return result.sort((a, b) => b.date.localeCompare(a.date));
//   };

//   const getAdherenceColor = (rate: number) => {
//     if (rate >= 80) return theme.success;
//     if (rate >= 50) return theme.warning;
//     return theme.error;
//   };

//   const getAdherenceText = (rate: number) => {
//     if (rate >= 80) return 'Excellent';
//     if (rate >= 60) return 'Good';
//     if (rate >= 40) return 'Fair';
//     return 'Poor';
//   };
  
//   const handleExportData = async () => {
//     try {
//       setIsExporting(true);
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
//       const userId = (await account.get()).$id;
//       const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
      
//       const [medicines, reminderHistory] = await Promise.all([
//         getUserMedicines(true),
//         getReminderHistory(userId, startDate, endDate),
//       ]);
      
//       const timeRangeLabel = timeRange === 'week' ? 'last_7_days' : 
//                             timeRange === 'month' ? 'last_30_days' : 'last_365_days';
                            
//       const medicationsForExport = medicines.map((med: any) => ({
//         id: med.medicineId,
//         name: med.medicineName,
//         color: med.color || '#3498db',
//         times: med.times,
//         dosage: med.dosage,
//         frequency: med.frequency,
//         startDate: med.startDate,
//         endDate: med.endDate,
//         isActive: med.isActive,
//         duration: med.duration || 0,
//         reminderEnabled: med.reminderEnabled,
//         currentSupply: med.currentSupply || 0,
//         totalSupply: med.totalSupply || 0,
//         refillReminder: med.refillReminder || false,
//         refillAt: med.refillAt || 0
//       }));
      
//       const doseHistoryForExport = reminderHistory.map((reminder: any) => ({
//         id: reminder.reminderId,
//         medicationId: reminder.medicineId,
//         timeTaken: reminder.actualTime,
//         scheduledTime: reminder.scheduledTime,
//         status: reminder.status,
//         timestamp: reminder.actualTime || reminder.scheduledTime,
//         taken: reminder.status === 'taken'
//       }));
                            
//       await exportAdherenceReport(medicationsForExport, doseHistoryForExport, startDate, endDate, timeRangeLabel);
//     } catch (error) {
//       console.error('Error exporting data:', error);
//       Alert.alert('Export Error', 'Failed to export adherence data');
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const formatDisplayDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       weekday: 'short', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };

//   const DailyDoseCard = ({ data }: { data: DailyDoses }) => {
//     return (
//       <View 
//         style={[
//           styles.dailyDoseCard, 
//           { backgroundColor: theme.card, ...shadow.small }
//         ]}
//       >
//         <View style={commonStyles.rowBetween}>
//           <Text style={[styles.dateHeader, { color: theme.text }]}>
//             {formatDisplayDate(data.date)}
//           </Text>
//           <View style={[
//             styles.adherenceBadge,
//             { backgroundColor: getAdherenceColor(data.adherenceRate) + '20' }
//           ]}>
//             <Text style={[
//               styles.adherenceBadgeText,
//               { color: getAdherenceColor(data.adherenceRate) }
//             ]}>
//               {Math.round(data.adherenceRate)}%
//             </Text>
//           </View>
//         </View>
        
//         <View style={[styles.doseDivider, { backgroundColor: theme.border + '30' }]} />
        
//         {data.doses.length === 0 ? (
//           <Text style={[styles.noDosesText, { color: theme.textSecondary }]}>
//             No scheduled doses for this day
//           </Text>
//         ) : (
//           (() => {
//             // Group doses by medication ID
//             const medicationGroups: {[key: string]: typeof data.doses} = {};
//             data.doses.forEach(dose => {
//               if (!medicationGroups[dose.medicationId]) {
//                 medicationGroups[dose.medicationId] = [];
//               }
//               medicationGroups[dose.medicationId].push(dose);
//             });
            
//             return Object.entries(medicationGroups).map(([medId, doses]) => (
//               <View key={medId} style={styles.medicationGroup}>
//                 {doses.map((dose, index) => (
//                   <View key={`${dose.medicationId}_${dose.scheduledTime}`} style={styles.doseItem}>
//                     <View 
//                       style={[
//                         styles.doseColorIndicator, 
//                         { backgroundColor: dose.color }
//                       ]} 
//                     />
//                     <View style={styles.doseDetails}>
//                       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                         <Text style={[styles.doseMedName, { color: theme.text }]}>
//                           {dose.medicationName}
//                         </Text>
//                         {dose.frequency && (
//                           <View style={[
//                             styles.frequencyBadge, 
//                             { backgroundColor: dose.color + '20', marginLeft: spacing.sm }
//                           ]}>
//                             <Text style={[
//                               styles.frequencyBadgeText, 
//                               { color: dose.color }
//                             ]}>
//                               {formatFrequencyText(dose.frequency)}
//                             </Text>
//                           </View>
//                         )}
//                       </View>
//                       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                         <Text style={[styles.doseTimeLabel, { color: theme.textSecondary }]}>
//                           Scheduled: 
//                         </Text>
//                         <Text style={[styles.doseTime, { color: theme.text }]}>
//                           {dose.scheduledTime}
//                         </Text>
//                       </View>
//                     </View>
//                     <View style={styles.doseStatus}>
//                       {dose.wasTaken ? (
//                         <View style={styles.takenContainer}>
//                           <Ionicons 
//                             name="checkmark-circle" 
//                             size={18} 
//                             color={theme.success} 
//                             style={styles.statusIcon}
//                           />
//                           <View>
//                             <Text style={[styles.statusText, { color: theme.success }]}>Taken</Text>
//                             <Text style={[styles.takenTime, { color: theme.textSecondary }]}>
//                               {dose.timeTaken}
//                               {dose.delay !== undefined && dose.delay > 15 && (
//                                 <Text style={[styles.delayText, { color: theme.warning }]}>
//                                   {' '}(+{Math.round(dose.delay)}m)
//                                 </Text>
//                               )}
//                             </Text>
//                           </View>
//                         </View>
//                       ) : (
//                         <View style={styles.missedContainer}>
//                           <Ionicons 
//                             name="close-circle" 
//                             size={18} 
//                             color={theme.error} 
//                             style={styles.statusIcon}
//                           />
//                           <Text style={[styles.statusText, { color: theme.error }]}>
//                             Missed
//                           </Text>
//                         </View>
//                       )}
//                     </View>
                    
//                     {index < doses.length - 1 && (
//                       <View 
//                         style={[
//                           styles.doseDivider, 
//                           { backgroundColor: theme.border + '30', marginLeft: spacing.lg }
//                         ]} 
//                       />
//                     )}
//                   </View>
//                 ))}
//               </View>
//             ));
//           })()
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={commonStyles.container}>
//       <Header
//         title="Medication Stats"
//         onBack={() => router.back()}
//         rightComponent={
//           <TouchableOpacity 
//             onPress={handleExportData}
//             style={[
//               styles.exportButton,
//               { backgroundColor: theme.tertiary + '20' }
//             ]}
//             disabled={isExporting || isLoading}
//           >
//             {isExporting ? (
//               <ActivityIndicator size="small" color={theme.tertiary} />
//             ) : (
//               <>
//                 <Ionicons name="download-outline" size={16} color={"white"} />
//                 <Text style={[styles.exportText, { color: "white" }]}>Export CSV</Text>
//               </>
//             )}
//           </TouchableOpacity>
//         }
//       />

//       <ScrollView 
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {isLoading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={theme.primary} />
//             <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
//               Loading statistics...
//             </Text>
//           </View>
//         ) : (
//           <>
//             {/* Time range selector */}
//             <View style={styles.timeRangeContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.timeRangeButton,
//                   timeRange === 'week' && styles.timeRangeButtonActive,
//                   { borderColor: theme.border },
//                   timeRange === 'week' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
//                 ]}
//                 onPress={() => setTimeRange('week')}
//               >
//                 <Text
//                   style={[
//                     styles.timeRangeText,
//                     { color: theme.text },
//                     timeRange === 'week' && { color: theme.primary, fontWeight: 'bold' },
//                   ]}
//                 >
//                   7 Days
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[
//                   styles.timeRangeButton,
//                   timeRange === 'month' && styles.timeRangeButtonActive,
//                   { borderColor: theme.border },
//                   timeRange === 'month' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
//                 ]}
//                 onPress={() => setTimeRange('month')}
//               >
//                 <Text
//                   style={[
//                     styles.timeRangeText,
//                     { color: theme.text },
//                     timeRange === 'month' && { color: theme.primary, fontWeight: 'bold' },
//                   ]}
//                 >
//                   30 Days
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[
//                   styles.timeRangeButton,
//                   timeRange === 'year' && styles.timeRangeButtonActive,
//                   { borderColor: theme.border },
//                   timeRange === 'year' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
//                 ]}
//                 onPress={() => setTimeRange('year')}
//               >
//                 <Text
//                   style={[
//                     styles.timeRangeText,
//                     { color: theme.text },
//                     timeRange === 'year' && { color: theme.primary, fontWeight: 'bold' },
//                   ]}
//                 >
//                   365 Days
//                 </Text>
//               </TouchableOpacity>
//             </View>
            
//             {/* Overall adherence card */}
//             <View style={[
//               styles.overallCard, 
//               { backgroundColor: theme.card, ...shadow.medium }
//             ]}>
//               <Text style={[styles.overallTitle, { color: theme.text }]}>
//                 Overall Adherence
//               </Text>
              
//               <View style={styles.adherenceDisplay}>
//                 <View style={[
//                   styles.adherenceCircle, 
//                   { borderColor: getAdherenceColor(overallAdherence) }
//                 ]}>
//                   <Text style={[
//                     styles.adherenceRate, 
//                     { color: getAdherenceColor(overallAdherence) }
//                   ]}>
//                     {Math.round(overallAdherence)}%
//                   </Text>
//                 </View>
                
//                 <View style={styles.adherenceTextContainer}>
//                   <Text style={[styles.adherenceLabel, { color: theme.text }]}>
//                     {getAdherenceText(overallAdherence)}
//                   </Text>
//                   <Text style={[styles.adherenceDescription, { color: theme.textSecondary }]}>
//                     {Math.round(overallAdherence) >= 80 
//                       ? 'Great job keeping up with your medications!' 
//                       : 'Try to improve your medication adherence.'}
//                   </Text>
//                 </View>
//               </View>
//             </View>
            
//             {/* Adherence trend chart */}
//             {adherenceTrend.length > 0 && (
//               <View style={[
//                 styles.trendCard,
//                 { backgroundColor: theme.card, ...shadow.small }
//               ]}>
//                 <Text style={[styles.sectionTitle, { color: theme.text }]}>
//                   Adherence Trend
//                 </Text>
//                 <View style={styles.chartContainer}>
//                   {renderAdherenceTrendChart()}
//                 </View>
//               </View>
//             )}

//             {/* Medication Details Section */}
//             <Text style={[styles.sectionTitle, { color: theme.text }]}>
//               Medication Details
//             </Text>
            
//             {stats.length > 0 ? (
//               stats.map(stat => (
//                 <View 
//                   key={stat.id}
//                   style={[
//                     styles.statCard, 
//                     { backgroundColor: theme.card, ...shadow.small }
//                   ]}
//                 >
//                   <View style={commonStyles.rowBetween}>
//                     <Text style={[styles.medicationName, { color: theme.text }]}>
//                       {stat.name}
//                     </Text>
//                     <View style={[
//                       styles.adherenceBadge,
//                       { backgroundColor: getAdherenceColor(stat.adherenceRate) + '20' }
//                     ]}>
//                       <Text style={[
//                         styles.adherenceBadgeText,
//                         { color: getAdherenceColor(stat.adherenceRate) }
//                       ]}>
//                         {Math.round(stat.adherenceRate)}%
//                       </Text>
//                     </View>
//                   </View>
                  
//                   <View style={[
//                     styles.progressContainer, 
//                     { backgroundColor: theme.border + '40' }
//                   ]}>
//                     <View 
//                       style={[
//                         styles.progressBar,
//                         { 
//                           backgroundColor: getAdherenceColor(stat.adherenceRate),
//                           width: `${Math.min(100, stat.adherenceRate)}%` 
//                         }
//                       ]}
//                     />
//                   </View>
                  
//                   <View style={commonStyles.rowBetween}>
//                     <Text style={[styles.doseInfo, { color: theme.textSecondary }]}>
//                       Taken: {stat.takenDoses} of {stat.totalDoses} doses ({Math.floor(stat.takenDoses / stat.dosesPerDay)} of {Math.floor(stat.totalDoses / stat.dosesPerDay)} days)
//                     </Text>
//                     <Text style={[styles.missedInfo, { color: theme.textSecondary }]}>
//                       Missed: {stat.missedDoses}
//                     </Text>
//                   </View>
//                   <Text style={[styles.frequencyInfo, { color: theme.textTertiary, marginTop: 4 }]}>
//                     {formatFrequencyText(stat.dosesPerDay)}
//                   </Text>
//                 </View>
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <Ionicons name="stats-chart" size={64} color={theme.textTertiary} />
//                 <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
//                   No medication data yet
//                 </Text>
//                 <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
//                   Start tracking your medications to see adherence statistics
//                 </Text>
//                 <Button
//                   title="Add Medication"
//                   onPress={() => router.push('/medications/add')}
//                   variant="primary"
//                   icon="add-circle-outline"
//                   style={{ marginTop: spacing.lg }}
//                 />
//               </View>
//             )}
            
//             {/* Daily Doses Section */}
//             {dailyDoses.length > 0 && (
//               <View style={{ marginTop: spacing.xl }}>
//                 <Text style={[styles.sectionTitle, { color: theme.text }]}>
//                   Daily Medication Doses
//                 </Text>
//                 <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
//                   Track your doses taken each day
//                 </Text>
                
//                 {dailyDoses.map(dailyDose => (
//                   <DailyDoseCard key={dailyDose.date} data={dailyDose} />
//                 ))}
//               </View>
//             )}
            
//             <View style={styles.footer}>
//               <Text style={[styles.statDisclaimer, { color: theme.textTertiary }]}>
//                 * Statistics are based on scheduled doses and your medication tracking history.
//               </Text>
//             </View>
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   content: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: spacing.md,
//   },
//   timeRangeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: spacing.md,
//   },
//   timeRangeButton: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.xs,
//     borderRadius: borderRadius.pill,
//     marginHorizontal: spacing.xs,
//     borderWidth: 1,
//   },
//   timeRangeButtonActive: {
//     borderWidth: 1,
//   },
//   timeRangeText: {
//     ...typography.body,
//   },
//   overallCard: {
//     borderRadius: borderRadius.large,
//     padding: spacing.lg,
//     marginBottom: spacing.lg,
//   },
//   overallTitle: {
//     ...typography.subheader,
//     marginBottom: spacing.md,
//     textAlign: 'center',
//   },
//   adherenceDisplay: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//   },
//   adherenceCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     borderWidth: 3,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   adherenceRate: {
//     ...typography.header,
//     fontWeight: 'bold',
//   },
//   adherenceTextContainer: {
//     flex: 1,
//     marginLeft: spacing.lg,
//   },
//   adherenceLabel: {
//     ...typography.subheader,
//     marginBottom: spacing.xs,
//   },
//   adherenceDescription: {
//     ...typography.body,
//   },
//   sectionTitle: {
//     ...typography.subheader,
//     marginBottom: spacing.md,
//   },
//   statCard: {
//     borderRadius: borderRadius.medium,
//     padding: spacing.md,
//     marginBottom: spacing.md,
//   },
//   medicationName: {
//     ...typography.title,
//     flex: 1,
//     marginBottom: spacing.sm,
//   },
//   adherenceBadge: {
//     paddingHorizontal: spacing.sm,
//     paddingVertical: spacing.xs / 2,
//     borderRadius: borderRadius.pill,
//   },
//   adherenceBadgeText: {
//     ...typography.caption,
//     fontWeight: 'bold',
//   },
//   progressContainer: {
//     height: 8,
//     borderRadius: 4,
//     marginVertical: spacing.sm,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//   },
//   doseInfo: {
//     ...typography.caption,
//   },
//   missedInfo: {
//     ...typography.caption,
//   },
//   frequencyInfo: {
//     ...typography.caption,
//     fontSize: typography.caption.fontSize - 1,
//   },
//   frequencyBadge: {
//     paddingHorizontal: spacing.xs,
//     paddingVertical: 2,
//     borderRadius: borderRadius.pill,
//   },
//   frequencyBadgeText: {
//     fontSize: typography.caption.fontSize - 2,
//     fontWeight: '600',
//   },
//   medicationGroup: {
//     marginBottom: spacing.md,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: spacing.xl,
//   },
//   emptyStateText: {
//     ...typography.subheader,
//     marginTop: spacing.md,
//     marginBottom: spacing.xs,
//   },
//   emptyStateSubtext: {
//     ...typography.body,
//     textAlign: 'center',
//     marginBottom: spacing.md,
//   },
//   footer: {
//     marginVertical: spacing.lg,
//   },
//   statDisclaimer: {
//     ...typography.caption,
//     textAlign: 'center',
//   },
//   exportButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.xs,
//     borderRadius: borderRadius.pill,
//     marginRight: spacing.xs,
//   },
//   exportText: {
//     fontSize: typography.caption.fontSize,
//     fontWeight: '600',
//     marginLeft: spacing.xs,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     ...typography.body,
//     marginTop: spacing.md,
//   },
//   trendCard: {
//     borderRadius: borderRadius.large,
//     padding: spacing.md,
//     marginBottom: spacing.lg,
//   },
//   chartContainer: {
//     marginTop: spacing.sm,
//     alignItems: 'center',
//   },
//   dailyDoseCard: {
//     borderRadius: borderRadius.medium,
//     padding: spacing.md,
//     marginBottom: spacing.md,
//   },
//   dateHeader: {
//     ...typography.title,
//     marginBottom: spacing.xs,
//   },
//   doseDivider: {
//     height: 1,
//     width: '100%',
//     marginVertical: spacing.sm,
//   },
//   noDosesText: {
//     ...typography.body,
//     textAlign: 'center',
//     marginVertical: spacing.md,
//   },
//   doseItem: {
//     marginVertical: spacing.xs,
//   },
//   doseColorIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     position: 'absolute',
//     top: spacing.sm,
//     left: 0,
//   },
//   doseDetails: {
//     paddingLeft: spacing.md,
//     marginBottom: spacing.xs,
//   },
//   doseMedName: {
//     ...typography.body,
//     fontWeight: '600',
//   },
//   doseTimeLabel: {
//     ...typography.caption,
//     marginRight: spacing.xs,
//   },
//   doseTime: {
//     ...typography.caption,
//     fontWeight: '500',
//   },
//   doseStatus: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingLeft: spacing.md,
//   },
//   takenContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   missedContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusIcon: {
//     marginRight: spacing.xs,
//   },
//   statusText: {
//     ...typography.caption,
//     fontWeight: '600',
//   },
//   takenTime: {
//     ...typography.caption,
//   },
//   delayText: {
//     ...typography.caption,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     ...typography.body,
//     marginTop: -spacing.sm,
//     marginBottom: spacing.md,
//   },
// });

















import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../utils/ThemeContext';
import { getUserMedicines } from '../../services/medicationService';
import { getReminderHistory, getAdherenceStats } from '../../services/doseHistoryService';
import { account } from '../../services/appwrite';
import { Medicine } from '../../services/collections';
import { borderRadius, createCommonStyles, shadow, spacing, typography } from '../../utils/StyleSystem';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { 
  exportAdherenceReport, 
  MedicationAdherenceData
} from '../../utils/exportData';

const { width } = Dimensions.get('window');
const BAR_HEIGHT = 180;

interface MedicationStat {
  id: string;
  name: string;
  color: string;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  onTimeDoses: number;
  lateDoses: number;
  averageDelay: number;
  dosesPerDay: number;
}

interface AdherenceTrend {
  date: string;
  adherenceRate: number;
}

interface DailyDose {
  medicationId: string;
  medicationName: string;
  color: string;
  scheduledTime: string;
  wasTaken: boolean;
  timeTaken?: string;
  delay?: number;
  frequency?: number;
}

interface DailyDoses {
  date: string;
  doses: DailyDose[];
  adherenceRate: number;
}

export default function StatsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState<MedicationStat[]>([]);
  const [overallAdherence, setOverallAdherence] = useState(0);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [adherenceTrend, setAdherenceTrend] = useState<AdherenceTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dailyDoses, setDailyDoses] = useState<DailyDoses[]>([]);
  const commonStyles = createCommonStyles(theme);
  
  // Helper function to format frequency text consistently
  const formatFrequencyText = (frequency: number): string => {
    if (frequency === 1) return 'Once daily';
    if (frequency === 2) return 'Twice daily';
    if (frequency === 3) return 'Three times daily';
    if (frequency === 4) return 'Four times daily';
    return `${frequency} times daily`;
  };

  // Helper function to generate expected doses for a medication on a given date
  const generateExpectedDoses = (medication: any, date: Date): DailyDose[] => {
    const expectedDoses: DailyDose[] = [];
    
    // Check if medication is active on this date
    const medicationStartDate = new Date(medication.startDate);
    const medicationEndDate = medication.endDate ? new Date(medication.endDate) : null;
    
    // Reset time components for proper date comparison
    medicationStartDate.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    
    // Skip if date is before medication start
    if (currentDate < medicationStartDate) return expectedDoses;
    
    // Skip if date is after medication end
    if (medicationEndDate) {
      medicationEndDate.setHours(0, 0, 0, 0);
      if (currentDate > medicationEndDate) return expectedDoses;
    }
    
    // Check if medication is marked as inactive
    if (medication.isActive === false) return expectedDoses;
    
    // Generate doses based on medication times
    if (medication.times && Array.isArray(medication.times)) {
      medication.times.forEach((time: string) => {
        expectedDoses.push({
          medicationId: medication.medicineId,
          medicationName: medication.medicineName,
          color: medication.color || '#3498db',
          scheduledTime: time,
          wasTaken: false, // Default to not taken
          frequency: medication.times.length
        });
      });
    }
    
    return expectedDoses;
  };

  // Function to render the adherence trend chart
  const renderAdherenceTrendChart = () => {
    if (adherenceTrend.length === 0) return null;
    
    const chartHeight = 150;
    const chartWidth = width - spacing.md * 4;
    const chartPadding = 20;
    const usableHeight = chartHeight - chartPadding * 2;
    const usableWidth = chartWidth - chartPadding * 2;
    
    const xStep = usableWidth / Math.max(adherenceTrend.length - 1, 1);
    
    // Generate path for the trend line
    let pathD = '';
    const points = adherenceTrend.map((item, index) => {
      const x = chartPadding + index * xStep;
      const y = chartPadding + usableHeight - (usableHeight * Math.min(item.adherenceRate, 100) / 100);
      
      if (index === 0) {
        pathD = `M ${x},${y}`;
      } else {
        pathD += ` L ${x},${y}`;
      }
      
      return { x, y, adherenceRate: item.adherenceRate };
    });

    return (
      <Svg height={chartHeight} width="100%" style={{ marginTop: spacing.md }}>
        {/* Chart grid lines */}
        <Line 
          x1={chartPadding} 
          y1={chartPadding} 
          x2={chartPadding} 
          y2={chartHeight - chartPadding}
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth="1"
        />
        <Line 
          x1={chartPadding} 
          y1={chartHeight - chartPadding} 
          x2={chartWidth - chartPadding} 
          y2={chartHeight - chartPadding}
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth="1"
        />
        
        {/* 50% line */}
        <Line 
          x1={chartPadding} 
          y1={chartPadding + usableHeight/2} 
          x2={chartWidth - chartPadding} 
          y2={chartPadding + usableHeight/2}
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        
        {/* Trend line */}
        <Path
          d={pathD}
          stroke={theme.primary}
          strokeWidth="2"
          fill="none"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={getAdherenceColor(point.adherenceRate)}
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </Svg>
    );
  };

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  // Reload stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [timeRange])
  );

  // Helper function to process reminder history into adherence data format
  const processReminderHistoryToAdherenceData = (medicines: any[], reminderHistory: any[], startDate: Date, endDate: Date): MedicationAdherenceData[] => {
    const adherenceData: MedicationAdherenceData[] = [];
    
    // Create a map for quick medicine lookup
    const medicineMap = new Map<string, any>();
    medicines.forEach(medicine => {
      medicineMap.set(medicine.medicineId, medicine);
    });
    
    // Process each reminder
    reminderHistory.forEach(reminder => {
      const medicine = medicineMap.get(reminder.medicineId);
      if (!medicine) return;
      
      const scheduledTime = new Date(reminder.scheduledTime);
      const date = scheduledTime.toISOString().split('T')[0];
      
      // Calculate delay if taken
      let delay = 0;
      if (reminder.status === 'taken' && reminder.actualTime) {
        const actualTime = new Date(reminder.actualTime);
        delay = Math.max(0, (actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
      }
      
      // Calculate days since start (assuming medication started when first reminder was created)
      const medicationStartDate = new Date(medicine.createdAt || startDate);
      const daysSinceStart = Math.floor((scheduledTime.getTime() - medicationStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate treatment day based on frequency
      const frequency = parseInt(medicine.frequency) || 1;
      const treatmentDay = Math.floor(daysSinceStart / frequency) + 1;
      
      adherenceData.push({
        medicationId: reminder.medicineId,
        medicationName: medicine.medicineName,
        dosage: medicine.dosage || 'N/A',
        frequency: medicine.frequency || '1',
        color: medicine.color || '#007AFF',
        date: date,
        scheduledTime: scheduledTime.toTimeString().slice(0, 5),
        wasTaken: reminder.status === 'taken',
        timeTaken: reminder.actualTime ? new Date(reminder.actualTime).toTimeString().slice(0, 5) : undefined,
        delay: reminder.status === 'taken' ? delay : undefined,
        daysSinceStart: daysSinceStart,
        treatmentDay: treatmentDay,
        currentSupply: medicine.currentSupply,
        totalSupply: medicine.totalSupply,
        supplyDaysLeft: medicine.currentSupply ? Math.floor(medicine.currentSupply / frequency) : undefined
      });
    });
    
    return adherenceData;
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Get current user ID
      const userId = (await account.get()).$id;
      
      // Get date range based on selected time range
      const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
      
      // Fetch data from Appwrite services
      const [medicines, reminderHistory] = await Promise.all([
        getUserMedicines(true), // Only active medicines
        getReminderHistory(userId, startDate, endDate),
      ]);

      console.log('=== STATS DEBUG: Loaded raw data ===');
      console.log('Medicines count:', medicines.length);
      console.log('Reminder history count:', reminderHistory.length);
      console.log('Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
      
      // Log medicine structure to understand the data
      if (medicines.length > 0) {
        console.log('Sample medicine structure:', {
          medicineId: medicines[0].medicineId,
          medicineName: medicines[0].medicineName,
          times: medicines[0].times,
          startDate: medicines[0].startDate,
          endDate: medicines[0].endDate,
          isActive: medicines[0].isActive
        });
      }
      
      // Generate comprehensive daily doses data that includes all expected doses
      const dailyDosesData = generateComprehensiveDailyDoses(medicines, reminderHistory, startDate, endDate);
      console.log('Generated daily doses data:', dailyDosesData.length, 'days');
      setDailyDoses(dailyDosesData);
      
      // Generate adherence trend
      const trendData = generateAdherenceTrend(dailyDosesData);
      setAdherenceTrend(trendData);

      // Calculate stats for each medication using comprehensive data
      const medicationStats: MedicationStat[] = medicines.map((medication: any) => {
        let totalDoses = 0;
        let takenDoses = 0;
        let onTimeDoses = 0;
        let lateDoses = 0;
        let delaySum = 0;
        let delayCount = 0;
        
        // Calculate stats from daily doses data
        dailyDosesData.forEach(dailyData => {
          const medicationDoses = dailyData.doses.filter(dose => dose.medicationId === medication.medicineId);
          
          medicationDoses.forEach(dose => {
            totalDoses++;
            if (dose.wasTaken) {
              takenDoses++;
              if (dose.delay !== undefined) {
                if (dose.delay <= 30) {
                  onTimeDoses++;
                } else {
                  lateDoses++;
                }
                delaySum += dose.delay;
                delayCount++;
              }
            }
          });
        });
        
        const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
        const averageDelay = delayCount > 0 ? delaySum / delayCount : 0;
        const missedDoses = totalDoses - takenDoses;
        
        return {
          id: medication.medicineId,
          name: medication.medicineName,
          color: medication.color || '#3498db',
          totalDoses: totalDoses,
          takenDoses: takenDoses,
          missedDoses: missedDoses,
          adherenceRate: adherenceRate,
          onTimeDoses: onTimeDoses,
          lateDoses: lateDoses,
          averageDelay: averageDelay,
          dosesPerDay: medication.times ? medication.times.length : 0,
        };
      }).filter((stat: any) => stat.totalDoses > 0);
      
      // Sort by adherence rate (highest first)
      medicationStats.sort((a, b) => b.adherenceRate - a.adherenceRate);
      
      // Calculate overall adherence
      const totalExpectedDoses = medicationStats.reduce((sum, stat) => sum + stat.totalDoses, 0);
      const totalTakenDoses = medicationStats.reduce((sum, stat) => sum + stat.takenDoses, 0);
      const overall = totalExpectedDoses > 0 ? (totalTakenDoses / totalExpectedDoses) * 100 : 0;
      
      setStats(medicationStats);
      setOverallAdherence(overall);
      
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load medication statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRangeFromTimeRange = (range: 'week' | 'month' | 'year') => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999); // End of today
    
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0); // Start of today
    
    switch (range) {
      case 'week':
        // Show last 7 days INCLUDING today (today + 6 previous days)
        startDate.setDate(now.getDate() - 6); // Go back 6 days from today
        break;
      case 'month':
        // Show last 30 days INCLUDING today (today + 29 previous days)
        startDate.setDate(now.getDate() - 29); // Go back 29 days from today
        break;
      case 'year':
        // Show last 365 days INCLUDING today (today + 364 previous days)
        startDate.setDate(now.getDate() - 364); // Go back 364 days from today
        break;
    }
    
    console.log('📅 Date range for stats:', {
      range,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      today: new Date().toISOString().split('T')[0]
    });
    
    return { startDate, endDate };
  };

  const generateAdherenceTrend = (dailyDosesData: DailyDoses[]): AdherenceTrend[] => {
    return dailyDosesData.map(dailyData => ({
      date: dailyData.date,
      adherenceRate: dailyData.adherenceRate
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  const generateComprehensiveDailyDoses = (medicines: any[], reminderHistory: any[], startDate: Date, endDate: Date): DailyDoses[] => {
    console.log('=== generateComprehensiveDailyDoses DEBUG ===');
    console.log('Input medicines:', medicines.length);
    console.log('Input reminderHistory:', reminderHistory.length);
    console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());
    
    const result: DailyDoses[] = [];
    const dayMilliseconds = 24 * 60 * 60 * 1000;
    
    // Create reminder lookup map
    const reminderMap = new Map<string, any>();
    reminderHistory.forEach(reminder => {
      const scheduledTime = new Date(reminder.scheduledTime);
      const date = scheduledTime.toISOString().split('T')[0];
      const time = scheduledTime.toTimeString().slice(0, 5);
      const key = `${reminder.medicineId}_${date}_${time}`;
      reminderMap.set(key, reminder);
    });
    
    console.log('Created reminder map with keys:', Array.from(reminderMap.keys()).slice(0, 5), '...');
    
    // Generate data for each date in range
    for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMilliseconds)) {
      const dateStr = d.toISOString().split('T')[0];
      const doses: DailyDose[] = [];
      
      console.log(`Processing date: ${dateStr}`);
      
      // For each active medication, generate expected doses
      medicines.forEach(medication => {
        // Check if medication is active on this date
        const medicationStartDate = new Date(medication.startDate);
        const medicationEndDate = medication.endDate ? new Date(medication.endDate) : null;
        
        // Reset time components for proper date comparison
        medicationStartDate.setHours(0, 0, 0, 0);
        const currentDate = new Date(d);
        currentDate.setHours(0, 0, 0, 0);
        
        // Skip if date is before medication start
        if (currentDate < medicationStartDate) {
          console.log(`Skipping ${medication.medicineName} on ${dateStr} - before start date`);
          return;
        }
        
        // Skip if date is after medication end
        if (medicationEndDate) {
          medicationEndDate.setHours(0, 0, 0, 0);
          if (currentDate > medicationEndDate) {
            console.log(`Skipping ${medication.medicineName} on ${dateStr} - after end date`);
            return;
          }
        }
        
        // Check if medication is marked as inactive
        if (medication.isActive === false) {
          console.log(`Skipping ${medication.medicineName} on ${dateStr} - inactive`);
          return;
        }
        
        // Check if medication has times array
        if (!medication.times || !Array.isArray(medication.times)) {
          console.log(`Skipping ${medication.medicineName} on ${dateStr} - no times array`);
          return;
        }
        
        console.log(`Processing ${medication.medicineName} with ${medication.times.length} doses on ${dateStr}`);
        
        // Generate doses based on medication times
        medication.times.forEach((time: string) => {
          const reminderKey = `${medication.medicineId}_${dateStr}_${time}`;
          const reminder = reminderMap.get(reminderKey);
          
          console.log(`  Time ${time}: reminder found = ${!!reminder}`);
          
          if (reminder) {
            // Found actual reminder data
            let delay = 0;
            if (reminder.status === 'taken' && reminder.actualTime) {
              const scheduledDateTime = new Date(`${dateStr}T${time}`);
              const actualTime = new Date(reminder.actualTime);
              delay = Math.max(0, (actualTime.getTime() - scheduledDateTime.getTime()) / (1000 * 60));
            }
            
            doses.push({
              medicationId: medication.medicineId,
              medicationName: medication.medicineName,
              color: medication.color || '#3498db',
              scheduledTime: time,
              wasTaken: reminder.status === 'taken',
              timeTaken: reminder.actualTime ? new Date(reminder.actualTime).toTimeString().slice(0, 5) : undefined,
              delay: reminder.status === 'taken' ? delay : undefined,
              frequency: medication.times.length
            });
          } else {
            // No reminder data, dose was missed or not yet created
            doses.push({
              medicationId: medication.medicineId,
              medicationName: medication.medicineName,
              color: medication.color || '#3498db',
              scheduledTime: time,
              wasTaken: false,
              frequency: medication.times.length
            });
          }
        });
      });
      
      // Calculate adherence rate for the day
      const totalDoses = doses.length;
      const takenDoses = doses.filter(dose => dose.wasTaken).length;
      const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;
      
      console.log(`Day ${dateStr}: ${takenDoses}/${totalDoses} doses taken (${adherenceRate.toFixed(1)}%)`);
      
      result.push({
        date: dateStr,
        doses,
        adherenceRate
      });
    }
    
    // Sort by date (most recent first)
    const sortedResult = result.sort((a, b) => b.date.localeCompare(a.date));
    console.log('Final result:', sortedResult.length, 'days generated');
    
    // Log today's data specifically
    const today = new Date().toISOString().split('T')[0];
    const todayData = sortedResult.find(day => day.date === today);
    if (todayData) {
      console.log('Today\'s data:', {
        date: todayData.date,
        dosesCount: todayData.doses.length,
        adherenceRate: todayData.adherenceRate,
        doses: todayData.doses.map(d => ({
          medication: d.medicationName,
          time: d.scheduledTime,
          taken: d.wasTaken
        }))
      });
    } else {
      console.log('No data found for today:', today);
    }
    
    return sortedResult;
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 80) return theme.success;
    if (rate >= 50) return theme.warning;
    return theme.error;
  };

  const getAdherenceText = (rate: number) => {
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    return 'Poor';
  };
  
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const userId = (await account.get()).$id;
      const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
      
      const [medicines, reminderHistory] = await Promise.all([
        getUserMedicines(true),
        getReminderHistory(userId, startDate, endDate),
      ]);
      
      const timeRangeLabel = timeRange === 'week' ? 'last_7_days' : 
                            timeRange === 'month' ? 'last_30_days' : 'last_365_days';
                            
      const medicationsForExport = medicines.map((med: any) => ({
        id: med.medicineId,
        name: med.medicineName,
        color: med.color || '#3498db',
        times: med.times,
        dosage: med.dosage,
        frequency: med.frequency,
        startDate: med.startDate,
        endDate: med.endDate,
        isActive: med.isActive,
        duration: med.duration || 0,
        reminderEnabled: med.reminderEnabled,
        currentSupply: med.currentSupply || 0,
        totalSupply: med.totalSupply || 0,
        refillReminder: med.refillReminder || false,
        refillAt: med.refillAt || 0
      }));
      
      const doseHistoryForExport = reminderHistory.map((reminder: any) => ({
        id: reminder.reminderId,
        medicationId: reminder.medicineId,
        timeTaken: reminder.actualTime,
        scheduledTime: reminder.scheduledTime,
        status: reminder.status,
        timestamp: reminder.actualTime || reminder.scheduledTime,
        taken: reminder.status === 'taken'
      }));
                            
      await exportAdherenceReport(medicationsForExport, doseHistoryForExport, startDate, endDate, timeRangeLabel);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Error', 'Failed to export adherence data');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Add this useEffect to debug the daily doses data
  useEffect(() => {
    console.log('=== DAILY DOSES DEBUG ===');
    console.log('Daily doses array length:', dailyDoses.length);
    
    if (dailyDoses.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayData = dailyDoses.find(day => day.date === today);
      
      console.log('Today\'s date string:', today);
      console.log('Today\'s data found:', !!todayData);
      
      if (todayData) {
        console.log('Today\'s doses:', todayData.doses.length);
        console.log('Today\'s adherence:', todayData.adherenceRate);
      }
      
      console.log('First few days in dailyDoses:', dailyDoses.slice(0, 3).map(d => ({
        date: d.date,
        dosesCount: d.doses.length
      })));
    }
  }, [dailyDoses]);

  const DailyDoseCard = ({ data }: { data: DailyDoses }) => {
    return (
      <View 
        style={[
          styles.dailyDoseCard, 
          { backgroundColor: theme.card, ...shadow.small }
        ]}
      >
        <View style={commonStyles.rowBetween}>
          <Text style={[styles.dateHeader, { color: theme.text }]}>
            {formatDisplayDate(data.date)}
          </Text>
          <View style={[
            styles.adherenceBadge,
            { backgroundColor: getAdherenceColor(data.adherenceRate) + '20' }
          ]}>
            <Text style={[
              styles.adherenceBadgeText,
              { color: getAdherenceColor(data.adherenceRate) }
            ]}>
              {Math.round(data.adherenceRate)}%
            </Text>
          </View>
        </View>
        
        <View style={[styles.doseDivider, { backgroundColor: theme.border + '30' }]} />
        
        {data.doses.length === 0 ? (
          <Text style={[styles.noDosesText, { color: theme.textSecondary }]}>
            No scheduled doses for this day
          </Text>
        ) : (
          (() => {
            // Group doses by medication ID
            const medicationGroups: {[key: string]: typeof data.doses} = {};
            data.doses.forEach(dose => {
              if (!medicationGroups[dose.medicationId]) {
                medicationGroups[dose.medicationId] = [];
              }
              medicationGroups[dose.medicationId].push(dose);
            });
            
            return Object.entries(medicationGroups).map(([medId, doses]) => (
              <View key={medId} style={styles.medicationGroup}>
                {doses.map((dose, index) => (
                  <View key={`${dose.medicationId}_${dose.scheduledTime}`} style={styles.doseItem}>
                    <View 
                      style={[
                        styles.doseColorIndicator, 
                        { backgroundColor: dose.color }
                      ]} 
                    />
                    <View style={styles.doseDetails}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.doseMedName, { color: theme.text }]}>
                          {dose.medicationName}
                        </Text>
                        {dose.frequency && (
                          <View style={[
                            styles.frequencyBadge, 
                            { backgroundColor: dose.color + '20', marginLeft: spacing.sm }
                          ]}>
                            <Text style={[
                              styles.frequencyBadgeText, 
                              { color: dose.color }
                            ]}>
                              {formatFrequencyText(dose.frequency)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.doseTimeLabel, { color: theme.textSecondary }]}>
                          Scheduled: 
                        </Text>
                        <Text style={[styles.doseTime, { color: theme.text }]}>
                          {dose.scheduledTime}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.doseStatus}>
                      {dose.wasTaken ? (
                        <View style={styles.takenContainer}>
                          <Ionicons 
                            name="checkmark-circle" 
                            size={18} 
                            color={theme.success} 
                            style={styles.statusIcon}
                          />
                          <View>
                            <Text style={[styles.statusText, { color: theme.success }]}>Taken</Text>
                            <Text style={[styles.takenTime, { color: theme.textSecondary }]}>
                              {dose.timeTaken}
                              {dose.delay !== undefined && dose.delay > 15 && (
                                <Text style={[styles.delayText, { color: theme.warning }]}>
                                  {' '}(+{Math.round(dose.delay)}m)
                                </Text>
                              )}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.missedContainer}>
                          <Ionicons 
                            name="close-circle" 
                            size={18} 
                            color={theme.error} 
                            style={styles.statusIcon}
                          />
                          <Text style={[styles.statusText, { color: theme.error }]}>
                            Missed
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {index < doses.length - 1 && (
                      <View 
                        style={[
                          styles.doseDivider, 
                          { backgroundColor: theme.border + '30', marginLeft: spacing.lg }
                        ]} 
                      />
                    )}
                  </View>
                ))}
              </View>
            ));
          })()
        )}
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
      <Header
        title="Medication Stats"
        onBack={() => router.back()}
        rightComponent={
          <TouchableOpacity 
            onPress={handleExportData}
            style={[
              styles.exportButton,
              { backgroundColor: theme.tertiary + '20' }
            ]}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.tertiary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={16} color={"white"} />
                <Text style={[styles.exportText, { color: "white" }]}>Export CSV</Text>
              </>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading statistics...
            </Text>
          </View>
        ) : (
          <>
            {/* Time range selector */}
            <View style={styles.timeRangeContainer}>
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  timeRange === 'week' && styles.timeRangeButtonActive,
                  { borderColor: theme.border },
                  timeRange === 'week' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
                ]}
                onPress={() => setTimeRange('week')}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    { color: theme.text },
                    timeRange === 'week' && { color: theme.primary, fontWeight: 'bold' },
                  ]}
                >
                  7 Days
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  timeRange === 'month' && styles.timeRangeButtonActive,
                  { borderColor: theme.border },
                  timeRange === 'month' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
                ]}
                onPress={() => setTimeRange('month')}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    { color: theme.text },
                    timeRange === 'month' && { color: theme.primary, fontWeight: 'bold' },
                  ]}
                >
                  30 Days
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.timeRangeButton,
                  timeRange === 'year' && styles.timeRangeButtonActive,
                  { borderColor: theme.border },
                  timeRange === 'year' && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
                ]}
                onPress={() => setTimeRange('year')}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    { color: theme.text },
                    timeRange === 'year' && { color: theme.primary, fontWeight: 'bold' },
                  ]}
                >
                  365 Days
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Overall adherence card */}
            <View style={[
              styles.overallCard, 
              { backgroundColor: theme.card, ...shadow.medium }
            ]}>
              <Text style={[styles.overallTitle, { color: theme.text }]}>
                Overall Adherence
              </Text>
              
              <View style={styles.adherenceDisplay}>
                <View style={[
                  styles.adherenceCircle, 
                  { borderColor: getAdherenceColor(overallAdherence) }
                ]}>
                  <Text style={[
                    styles.adherenceRate, 
                    { color: getAdherenceColor(overallAdherence) }
                  ]}>
                    {Math.round(overallAdherence)}%
                  </Text>
                </View>
                
                <View style={styles.adherenceTextContainer}>
                  <Text style={[styles.adherenceLabel, { color: theme.text }]}>
                    {getAdherenceText(overallAdherence)}
                  </Text>
                  <Text style={[styles.adherenceDescription, { color: theme.textSecondary }]}>
                    {Math.round(overallAdherence) >= 80 
                      ? 'Great job keeping up with your medications!' 
                      : 'Try to improve your medication adherence.'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Adherence trend chart */}
            {adherenceTrend.length > 0 && (
              <View style={[
                styles.trendCard,
                { backgroundColor: theme.card, ...shadow.small }
              ]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Adherence Trend
                </Text>
                <View style={styles.chartContainer}>
                  {renderAdherenceTrendChart()}
                </View>
              </View>
            )}

            {/* Medication Details Section */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Medication Details
            </Text>
            
            {stats.length > 0 ? (
              stats.map(stat => (
                <View 
                  key={stat.id}
                  style={[
                    styles.statCard, 
                    { backgroundColor: theme.card, ...shadow.small }
                  ]}
                >
                  <View style={commonStyles.rowBetween}>
                    <Text style={[styles.medicationName, { color: theme.text }]}>
                      {stat.name}
                    </Text>
                    <View style={[
                      styles.adherenceBadge,
                      { backgroundColor: getAdherenceColor(stat.adherenceRate) + '20' }
                    ]}>
                      <Text style={[
                        styles.adherenceBadgeText,
                        { color: getAdherenceColor(stat.adherenceRate) }
                      ]}>
                        {Math.round(stat.adherenceRate)}%
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.progressContainer, 
                    { backgroundColor: theme.border + '40' }
                  ]}>
                    <View 
                      style={[
                        styles.progressBar,
                        { 
                          backgroundColor: getAdherenceColor(stat.adherenceRate),
                          width: `${Math.min(100, stat.adherenceRate)}%` 
                        }
                      ]}
                    />
                  </View>
                  
                  <View style={commonStyles.rowBetween}>
                    <Text style={[styles.doseInfo, { color: theme.textSecondary }]}>
                      Taken: {stat.takenDoses} of {stat.totalDoses} doses ({Math.floor(stat.takenDoses / stat.dosesPerDay)} of {Math.floor(stat.totalDoses / stat.dosesPerDay)} days)
                    </Text>
                    <Text style={[styles.missedInfo, { color: theme.textSecondary }]}>
                      Missed: {stat.missedDoses}
                    </Text>
                  </View>
                  <Text style={[styles.frequencyInfo, { color: theme.textTertiary, marginTop: 4 }]}>
                    {formatFrequencyText(stat.dosesPerDay)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="stats-chart" size={64} color={theme.textTertiary} />
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  No medication data yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
                  Start tracking your medications to see adherence statistics
                </Text>
                <Button
                  title="Add Medication"
                  onPress={() => router.push('/medications/add')}
                  variant="primary"
                  icon="add-circle-outline"
                  style={{ marginTop: spacing.lg }}
                />
              </View>
            )}
            
            {/* Daily Doses Section */}
            {dailyDoses.length > 0 && (
              <View style={{ marginTop: spacing.xl }}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Daily Medication Doses
                </Text>
                <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                  Track your doses taken each day
                </Text>
                
                {dailyDoses.map(dailyDose => (
                  <DailyDoseCard key={dailyDose.date} data={dailyDose} />
                ))}
              </View>
            )}
            
            <View style={styles.footer}>
              <Text style={[styles.statDisclaimer, { color: theme.textTertiary }]}>
                * Statistics are based on scheduled doses and your medication tracking history.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  timeRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
  },
  timeRangeButtonActive: {
    borderWidth: 1,
  },
  timeRangeText: {
    ...typography.body,
  },
  overallCard: {
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  overallTitle: {
    ...typography.subheader,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  adherenceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  adherenceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adherenceRate: {
    ...typography.header,
    fontWeight: 'bold',
  },
  adherenceTextContainer: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  adherenceLabel: {
    ...typography.subheader,
    marginBottom: spacing.xs,
  },
  adherenceDescription: {
    ...typography.body,
  },
  sectionTitle: {
    ...typography.subheader,
    marginBottom: spacing.md,
  },
  statCard: {
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  medicationName: {
    ...typography.title,
    flex: 1,
    marginBottom: spacing.sm,
  },
  adherenceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.pill,
  },
  adherenceBadgeText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  doseInfo: {
    ...typography.caption,
  },
  missedInfo: {
    ...typography.caption,
  },
  frequencyInfo: {
    ...typography.caption,
    fontSize: typography.caption.fontSize - 1,
  },
  frequencyBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  frequencyBadgeText: {
    fontSize: typography.caption.fontSize - 2,
    fontWeight: '600',
  },
  medicationGroup: {
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.subheader,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  footer: {
    marginVertical: spacing.lg,
  },
  statDisclaimer: {
    ...typography.caption,
    textAlign: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginRight: spacing.xs,
  },
  exportText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  trendCard: {
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  dailyDoseCard: {
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dateHeader: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  doseDivider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.sm,
  },
  noDosesText: {
    ...typography.body,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  doseItem: {
    marginVertical: spacing.xs,
  },
  doseColorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: spacing.sm,
    left: 0,
  },
  doseDetails: {
    paddingLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  doseMedName: {
    ...typography.body,
    fontWeight: '600',
  },
  doseTimeLabel: {
    ...typography.caption,
    marginRight: spacing.xs,
  },
  doseTime: {
    ...typography.caption,
    fontWeight: '500',
  },
  doseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
  },
  takenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  takenTime: {
    ...typography.caption,
  },
  delayText: {
    ...typography.caption,
    fontWeight: '600',
  },
  sectionDescription: {
    ...typography.body,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
});