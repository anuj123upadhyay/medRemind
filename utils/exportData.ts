import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Medication, DoseHistory } from './storage';

/**
 * Downloads a file on web platform using browser download
 */
const downloadFileWeb = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
};

/**
 * Cross-platform file export function
 */
const exportFile = async (content: string, filename: string): Promise<void> => {
  if (Platform.OS === 'web') {
    downloadFileWeb(content, filename);
  } else {
    // For mobile platforms, use the native file system
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error("Sharing is not available on this device");
    }
  }
};

export interface MedicationAdherenceData {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  color: string;
  date: string;
  scheduledTime: string;
  wasTaken: boolean;
  timeTaken?: string;
  delay?: number; // in minutes
  daysSinceStart?: number;
  treatmentDay?: number;
  currentSupply?: number;
  totalSupply?: number;
  supplyDaysLeft?: number;
}

/**
 * Formats date to YYYY-MM-DD format
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Processes medication and dose history to generate adherence data
 * Improved to better handle medication frequency
 */
export const processAdherenceData = (
  medications: Medication[],
  doseHistory: DoseHistory[],
  startDate: Date,
  endDate: Date
): MedicationAdherenceData[] => {
  const result: MedicationAdherenceData[] = [];
  
  // Create a map for lookup of dose history - grouped by medication and date
  const dosesByMedAndDate: Record<string, DoseHistory[]> = {};
  doseHistory.forEach((dose) => {
    const doseDate = new Date(dose.timestamp);
    const dateKey = formatDate(doseDate);
    const medDateKey = `${dose.medicationId}_${dateKey}`;
    
    if (!dosesByMedAndDate[medDateKey]) {
      dosesByMedAndDate[medDateKey] = [];
    }
    
    dosesByMedAndDate[medDateKey].push(dose);
  });

  // Iterate through date range
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = formatDate(date);
    
    medications.forEach(med => {
      // Check if this medication should be considered for this date
      const medStartDate = new Date(med.startDate);
      medStartDate.setHours(0, 0, 0, 0);
      
      if (date < medStartDate) {
        return; // Skip if date is before medication start date
      }
      
      // Check if medication was active on this date based on duration
      // Handle both integer (database) and string (UI) duration formats
      let durationDays: number;
      if (typeof med.duration === 'number') {
        // Duration is stored as integer in database (-1 for ongoing, positive for days)
        durationDays = med.duration;
      } else if (typeof med.duration === 'string') {
        // Duration is in string format (e.g., "30 days", "Ongoing")
        if (med.duration.toLowerCase() === 'ongoing') {
          durationDays = -1;
        } else {
          const match = med.duration.match(/^(\d+)/);
          durationDays = match ? parseInt(match[1]) : -1;
        }
      } else {
        // Fallback for undefined/null duration
        durationDays = -1;
      }
      
      if (durationDays !== -1) { // Not ongoing
        const endDate = new Date(medStartDate);
        endDate.setDate(endDate.getDate() + durationDays);
        
        if (date > endDate) {
          return; // Skip if date is after medication end date
        }
      }
      
      // Get all doses for this medication on this date
      const medDateKey = `${med.id}_${dateStr}`;
      const dosesForDay = [...(dosesByMedAndDate[medDateKey] || [])];
      const usedDoseIds = new Set<string>(); // Track used dose IDs to prevent double counting
      
      // For each scheduled time of this medication
      med.times.forEach((scheduledTime, index) => {
        // For once-daily medications, we only need one entry even if there are multiple scheduled times
        if (med.times.length === 1 && index > 0) {
          return; // Skip additional times for once-daily medications
        }
        
        // Try to find a matching dose for this time slot
        let matchedDose: DoseHistory | undefined;
        
        if (med.times.length === 1) {
          // For medications taken once daily, any dose taken that day counts
          matchedDose = dosesForDay.find(dose => dose.taken && !usedDoseIds.has(dose.id));
        } else {
          // For medications with multiple daily doses, try to match by time
          // Get the scheduled hour and minute
          const [schedHours, schedMinutes] = scheduledTime.split(':').map(num => parseInt(num, 10));
          const schedDateTime = new Date(date);
          schedDateTime.setHours(schedHours, schedMinutes, 0, 0);
          
          // Find the closest dose within a reasonable time window
          let bestMatch: DoseHistory | undefined;
          let bestTimeDiff = Infinity;
          
          for (const dose of dosesForDay) {
            // Skip doses that have already been matched to another time slot
            if (usedDoseIds.has(dose.id) || !dose.taken) continue;
            
            const doseTime = new Date(dose.timestamp);
            const timeDiffMinutes = Math.abs(
              (doseTime.getTime() - schedDateTime.getTime()) / (60 * 1000)
            );
            
            // Consider it a match if within 2 hours (120 minutes) of scheduled time
            // and it's the closest match so far
            if (timeDiffMinutes <= 120 && timeDiffMinutes < bestTimeDiff) {
              bestMatch = dose;
              bestTimeDiff = timeDiffMinutes;
            }
          }
          
          matchedDose = bestMatch;
        }
        
        let wasTaken = false;
        let timeTaken: string | undefined = undefined;
        let delay: number | undefined = undefined;
        
        if (matchedDose && matchedDose.taken) {
          wasTaken = true;
          usedDoseIds.add(matchedDose.id); // Mark this dose as used
          
          // Calculate actual time taken and delay
          const doseTime = new Date(matchedDose.timestamp);
          timeTaken = doseTime.toTimeString().substring(0, 5);
          
          // Calculate delay in minutes
          const [schedHours, schedMinutes] = scheduledTime.split(':').map(num => parseInt(num, 10));
          const scheduledDateTime = new Date(date);
          scheduledDateTime.setHours(schedHours, schedMinutes, 0, 0);
          
          delay = Math.round((doseTime.getTime() - scheduledDateTime.getTime()) / (60 * 1000));
        }
        
        // Calculate additional metrics
        const startDate = new Date(med.startDate);
        const currentDate = new Date(date);
        const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const treatmentDay = daysSinceStart + 1;
        
        // Calculate supply information
        const dailyDoses = med.times.length;
        const supplyDaysLeft = med.currentSupply && dailyDoses > 0 
          ? Math.floor(med.currentSupply / dailyDoses) 
          : undefined;
        
        result.push({
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage || '',
          frequency: `${med.times.length}x daily`,
          color: med.color || '#E91E63',
          date: dateStr,
          scheduledTime: scheduledTime,
          wasTaken,
          daysSinceStart,
          treatmentDay,
          currentSupply: med.currentSupply,
          totalSupply: med.totalSupply,
          supplyDaysLeft,
          ...(wasTaken && { timeTaken, delay })
        });
      });
    });
  }
  
  return result;
};

/**
 * Converts adherence data to CSV format with comprehensive metrics
 */
export const convertToCsv = (data: MedicationAdherenceData[]): string => {
  // Define comprehensive CSV headers
  const headers = [
    'Medication Name',
    'Dosage',
    'Frequency',
    'Color',
    'Date',
    'Scheduled Time',
    'Was Taken',
    'Time Taken',
    'Delay (minutes)',
    'Days Since Start',
    'Treatment Day',
    'Current Supply',
    'Total Supply',
    'Supply Days Left',
    'Adherence Status',
    'Supply Status'
  ];
  
  // Convert data to CSV rows with enhanced information
  const rows = data.map(item => {
    // Determine adherence status
    let adherenceStatus = 'Not Taken';
    if (item.wasTaken) {
      if (item.delay !== undefined) {
        if (item.delay <= 30 && item.delay >= -30) {
          adherenceStatus = 'On Time';
        } else if (item.delay > 30) {
          adherenceStatus = 'Late';
        } else {
          adherenceStatus = 'Early';
        }
      } else {
        adherenceStatus = 'Taken';
      }
    }
    
    // Determine supply status
    let supplyStatus = 'Unknown';
    if (item.supplyDaysLeft !== undefined) {
      if (item.supplyDaysLeft <= 3) {
        supplyStatus = 'Critical';
      } else if (item.supplyDaysLeft <= 7) {
        supplyStatus = 'Low';
      } else if (item.supplyDaysLeft <= 14) {
        supplyStatus = 'Medium';
      } else {
        supplyStatus = 'Good';
      }
    }
    
    return [
      item.medicationName,
      item.dosage,
      item.frequency,
      item.color,
      item.date,
      item.scheduledTime,
      item.wasTaken ? 'Yes' : 'No',
      item.timeTaken || '-',
      item.delay !== undefined ? item.delay.toString() : '-',
      item.daysSinceStart?.toString() || '-',
      item.treatmentDay?.toString() || '-',
      item.currentSupply?.toString() || '-',
      item.totalSupply?.toString() || '-',
      item.supplyDaysLeft?.toString() || '-',
      adherenceStatus,
      supplyStatus
    ];
  });
  
  // Combine headers and rows
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

/**
 * Exports adherence data to a CSV file and shares it
 */
export const exportAdherenceReport = async (
  medications: Medication[],
  doseHistory: DoseHistory[],
  startDate: Date,
  endDate: Date,
  timeRangeLabel: string
): Promise<void> => {
  try {
    // Process data
    const adherenceData = processAdherenceData(medications, doseHistory, startDate, endDate);
    
    // Group data by date for daily view
    const dailyData = groupAdherenceDataByDate(adherenceData);
    
    // Generate comprehensive summary report
    const summaryReport = generateSummaryReport(adherenceData, dailyData);
    
    // Convert all data to CSV
    const detailedCsvContent = convertToCsv(adherenceData);
    const dailyCsvContent = convertDailyDataToCsv(dailyData);
    const summaryCsvContent = summaryReport;
    
    // Generate filenames with current date
    const formattedDateNow = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const detailedFileName = `medremind_detailed_${timeRangeLabel}_${formattedDateNow}.csv`;
    const dailyFileName = `medremind_daily_${timeRangeLabel}_${formattedDateNow}.csv`;
    const summaryFileName = `medremind_summary_${timeRangeLabel}_${formattedDateNow}.csv`;
    
    // Export files using cross-platform method
    if (Platform.OS === 'web') {
      // On web, download all three files
      await exportFile(detailedCsvContent, detailedFileName);
      await exportFile(dailyCsvContent, dailyFileName);
      await exportFile(summaryCsvContent, summaryFileName);
    } else {
      // On mobile, use native file system and sharing
      const detailedFileUri = `${FileSystem.documentDirectory}${detailedFileName}`;
      const dailyFileUri = `${FileSystem.documentDirectory}${dailyFileName}`;
      const summaryFileUri = `${FileSystem.documentDirectory}${summaryFileName}`;
      
      await FileSystem.writeAsStringAsync(detailedFileUri, detailedCsvContent);
      await FileSystem.writeAsStringAsync(dailyFileUri, dailyCsvContent);
      await FileSystem.writeAsStringAsync(summaryFileUri, summaryCsvContent);
      
      // Share the files
      if (await Sharing.isAvailableAsync()) {
        // Share the summary report as the primary file
        await Sharing.shareAsync(summaryFileUri);
      } else {
        throw new Error("Sharing is not available on this device");
      }
    }
  } catch (error) {
    console.error('Error exporting adherence data:', error);
    throw error;
  }
};

/**
 * Calculate adherence statistics for a specific time period
 * Properly handles medications with different dosing frequencies
 */
export const calculateAdherenceStats = (
  adherenceData: MedicationAdherenceData[]
) => {
  if (adherenceData.length === 0) {
    return {
      adherenceRate: 0,
      totalDoses: 0,
      takenDoses: 0,
      missedDoses: 0,
      averageDelay: 0,
      onTimeDoses: 0,
      lateDoses: 0
    };
  }
  
  // Group data by medicationId and date to handle medications with different frequencies
  const groupedByMedAndDate = new Map<string, MedicationAdherenceData[]>();
  
  adherenceData.forEach(data => {
    const key = `${data.medicationId}_${data.date}`;
    if (!groupedByMedAndDate.has(key)) {
      groupedByMedAndDate.set(key, []);
    }
    groupedByMedAndDate.get(key)!.push(data);
  });
  
  // Count taken and expected doses correctly
  let takenDoses = 0;
  let totalDoses = 0;
  let onTimeDoses = 0;
  let lateDoses = 0;
  
  groupedByMedAndDate.forEach((medDayData: MedicationAdherenceData[], medDateKey: string) => {
    // For each medication-date pair, the expected number of doses is the
    // number of entries for that medication on that date (which matches the medication's times array length)
    const expectedDosesForMedOnDay = medDayData.length;
    const takenDosesForMedOnDay = medDayData.filter(d => d.wasTaken).length;
    
    takenDoses += takenDosesForMedOnDay;
    totalDoses += expectedDosesForMedOnDay;
    
    // Calculate on-time and late doses
    onTimeDoses += medDayData.filter(d => d.wasTaken && d.delay !== undefined && d.delay <= 30 && d.delay >= 0).length;
    lateDoses += medDayData.filter(d => d.wasTaken && d.delay !== undefined && d.delay > 30).length;
  });
  
  const missedDoses = totalDoses - takenDoses;
  
  // Calculate average delay for taken doses
  const delays = adherenceData
    .filter(d => d.wasTaken && d.delay !== undefined)
    .map(d => d.delay!);
  
  const averageDelay = delays.length > 0 
    ? delays.reduce((sum, delay) => sum + delay, 0) / delays.length 
    : 0;
  
  return {
    adherenceRate: totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0,
    totalDoses,
    takenDoses,
    missedDoses,
    averageDelay,
    onTimeDoses,
    lateDoses
  };
}

interface DailyAdherenceSummary {
  date: string;
  medications: string[];
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  onTimeDoses: number;
  lateDoses: number;
  earlyDoses: number;
  adherenceRate: number;
  averageDelay: number;
  medicationCount: number;
  perfectAdherenceDays: number;
}

/**
 * Group adherence data by date for daily summary
 * Properly handles medications with different frequencies
 */
export const groupAdherenceDataByDate = (
  adherenceData: MedicationAdherenceData[]
): DailyAdherenceSummary[] => {
  const dailyMap: Record<string, {
    medications: Set<string>;
    totalDoses: number;
    takenDoses: number;
    onTimeDoses: number;
    lateDoses: number;
    earlyDoses: number;
    delays: number[];
    // Track counts per medication to properly handle different frequencies
    medDoses: Record<string, {
      name: string, 
      expectedCount: number, 
      takenCount: number
    }>;
  }> = {};
  
  // Group data by date and track per-medication stats
  adherenceData.forEach(data => {
    if (!dailyMap[data.date]) {
      dailyMap[data.date] = {
        medications: new Set(),
        totalDoses: 0,
        takenDoses: 0,
        onTimeDoses: 0,
        lateDoses: 0,
        earlyDoses: 0,
        delays: [],
        medDoses: {}
      };
    }
    
    // Track the medication
    dailyMap[data.date].medications.add(data.medicationName);
    
    // Initialize tracking for this medication if needed
    if (!dailyMap[data.date].medDoses[data.medicationId]) {
      dailyMap[data.date].medDoses[data.medicationId] = {
        name: data.medicationName,
        expectedCount: 0,
        takenCount: 0
      };
    }
    
    // Count doses for this medication
    dailyMap[data.date].medDoses[data.medicationId].expectedCount++;
    dailyMap[data.date].totalDoses++;
    
    if (data.wasTaken) {
      dailyMap[data.date].takenDoses++;
      dailyMap[data.date].medDoses[data.medicationId].takenCount++;
      
      if (data.delay !== undefined) {
        dailyMap[data.date].delays.push(data.delay);
        if (data.delay <= 30 && data.delay >= -30) {
          dailyMap[data.date].onTimeDoses++;
        } else if (data.delay > 30) {
          dailyMap[data.date].lateDoses++;
        } else if (data.delay < -30) {
          dailyMap[data.date].earlyDoses++;
        }
      }
    }
  });
  
  // Convert map to array and calculate comprehensive metrics
  const result: DailyAdherenceSummary[] = [];
  for (const [date, summary] of Object.entries(dailyMap)) {
    const averageDelay = summary.delays.length > 0 
      ? summary.delays.reduce((sum, delay) => sum + delay, 0) / summary.delays.length 
      : 0;
    
    const perfectAdherence = summary.totalDoses === summary.takenDoses ? 1 : 0;
    
    result.push({
      date,
      medications: Array.from(summary.medications),
      totalDoses: summary.totalDoses,
      takenDoses: summary.takenDoses,
      missedDoses: summary.totalDoses - summary.takenDoses,
      onTimeDoses: summary.onTimeDoses,
      lateDoses: summary.lateDoses,
      earlyDoses: summary.earlyDoses,
      adherenceRate: summary.totalDoses > 0 
        ? (summary.takenDoses / summary.totalDoses) * 100 
        : 0,
      averageDelay: Math.round(averageDelay),
      medicationCount: summary.medications.size,
      perfectAdherenceDays: perfectAdherence
    });
  }
  
  // Sort by date
  return result.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Converts daily adherence data to CSV format with comprehensive metrics
 */
export const convertDailyDataToCsv = (data: DailyAdherenceSummary[]): string => {
  // Define comprehensive CSV headers
  const headers = [
    'Date',
    'Day of Week',
    'Medications',
    'Medication Count',
    'Total Scheduled Doses',
    'Taken Doses',
    'Missed Doses',
    'On-Time Doses',
    'Late Doses',
    'Early Doses',
    'Adherence Rate (%)',
    'Average Delay (minutes)',
    'Perfect Adherence Day',
    'Adherence Grade'
  ];
  
  // Convert data to CSV rows with enhanced information
  const rows = data.map(item => {
    // Calculate day of week
    const date = new Date(item.date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Determine adherence grade
    let adherenceGrade = 'F';
    if (item.adherenceRate >= 95) adherenceGrade = 'A+';
    else if (item.adherenceRate >= 90) adherenceGrade = 'A';
    else if (item.adherenceRate >= 85) adherenceGrade = 'B+';
    else if (item.adherenceRate >= 80) adherenceGrade = 'B';
    else if (item.adherenceRate >= 75) adherenceGrade = 'C+';
    else if (item.adherenceRate >= 70) adherenceGrade = 'C';
    else if (item.adherenceRate >= 60) adherenceGrade = 'D';
    
    return [
      item.date,
      dayOfWeek,
      item.medications.join(', '),
      item.medicationCount.toString(),
      item.totalDoses.toString(),
      item.takenDoses.toString(),
      item.missedDoses.toString(),
      item.onTimeDoses.toString(),
      item.lateDoses.toString(),
      item.earlyDoses.toString(),
      item.adherenceRate.toFixed(1),
      item.averageDelay.toString(),
      item.perfectAdherenceDays ? 'Yes' : 'No',
      adherenceGrade
    ];
  });
  
  // Combine headers and rows
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

/**
 * Calculate overall adherence statistics for the report period
 */
export const calculateOverallStats = (adherenceData: MedicationAdherenceData[]) => {
  if (adherenceData.length === 0) {
    return {
      reportPeriod: { startDate: '', endDate: '', totalDays: 0 },
      overallMetrics: {
        totalDoses: 0,
        takenDoses: 0,
        missedDoses: 0,
        adherenceRate: 0,
        averageDelay: 0,
        onTimeRate: 0,
        lateRate: 0,
        earlyRate: 0
      },
      medicationBreakdown: [],
      timePatterns: {
        bestDay: '',
        worstDay: '',
        bestTimeSlot: '',
        worstTimeSlot: ''
      },
      trends: {
        improvingAdherence: false,
        consistentTiming: false,
        supplyIssues: []
      }
    };
  }

  // Calculate report period
  const dates = adherenceData.map(d => d.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const totalDays = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Overall metrics
  const totalDoses = adherenceData.length;
  const takenDoses = adherenceData.filter(d => d.wasTaken).length;
  const missedDoses = totalDoses - takenDoses;
  const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

  // Timing analysis
  const takenWithDelay = adherenceData.filter(d => d.wasTaken && d.delay !== undefined);
  const averageDelay = takenWithDelay.length > 0 
    ? takenWithDelay.reduce((sum, d) => sum + d.delay!, 0) / takenWithDelay.length 
    : 0;

  const onTimeDoses = takenWithDelay.filter(d => d.delay! >= -30 && d.delay! <= 30).length;
  const lateDoses = takenWithDelay.filter(d => d.delay! > 30).length;
  const earlyDoses = takenWithDelay.filter(d => d.delay! < -30).length;

  const onTimeRate = takenWithDelay.length > 0 ? (onTimeDoses / takenWithDelay.length) * 100 : 0;
  const lateRate = takenWithDelay.length > 0 ? (lateDoses / takenWithDelay.length) * 100 : 0;
  const earlyRate = takenWithDelay.length > 0 ? (earlyDoses / takenWithDelay.length) * 100 : 0;

  // Medication breakdown
  const medBreakdown = adherenceData.reduce((acc, d) => {
    if (!acc[d.medicationId]) {
      acc[d.medicationId] = {
        name: d.medicationName,
        dosage: d.dosage,
        frequency: d.frequency,
        color: d.color,
        totalDoses: 0,
        takenDoses: 0,
        adherenceRate: 0,
        averageDelay: 0,
        currentSupply: d.currentSupply,
        supplyDaysLeft: d.supplyDaysLeft
      };
    }
    acc[d.medicationId].totalDoses++;
    if (d.wasTaken) {
      acc[d.medicationId].takenDoses++;
    }
    return acc;
  }, {} as Record<string, any>);

  // Calculate adherence rates for each medication
  const medicationBreakdown = Object.values(medBreakdown).map((med: any) => ({
    ...med,
    adherenceRate: med.totalDoses > 0 ? (med.takenDoses / med.totalDoses) * 100 : 0,
    missedDoses: med.totalDoses - med.takenDoses
  }));

  // Day of week analysis
  const dayAnalysis = adherenceData.reduce((acc, d) => {
    const dayOfWeek = new Date(d.date).toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[dayOfWeek]) {
      acc[dayOfWeek] = { total: 0, taken: 0 };
    }
    acc[dayOfWeek].total++;
    if (d.wasTaken) acc[dayOfWeek].taken++;
    return acc;
  }, {} as Record<string, { total: number; taken: number }>);

  const dayRates = Object.entries(dayAnalysis).map(([day, stats]) => ({
    day,
    rate: stats.total > 0 ? (stats.taken / stats.total) * 100 : 0
  }));

  const bestDay = dayRates.reduce((best, current) => current.rate > best.rate ? current : best, dayRates[0])?.day || '';
  const worstDay = dayRates.reduce((worst, current) => current.rate < worst.rate ? current : worst, dayRates[0])?.day || '';

  // Time slot analysis
  const timeAnalysis = adherenceData.reduce((acc, d) => {
    const hour = parseInt(d.scheduledTime.split(':')[0]);
    const timeSlot = hour < 6 ? 'Early Morning' : 
                   hour < 12 ? 'Morning' : 
                   hour < 17 ? 'Afternoon' : 
                   hour < 21 ? 'Evening' : 'Night';
    
    if (!acc[timeSlot]) {
      acc[timeSlot] = { total: 0, taken: 0 };
    }
    acc[timeSlot].total++;
    if (d.wasTaken) acc[timeSlot].taken++;
    return acc;
  }, {} as Record<string, { total: number; taken: number }>);

  const timeRates = Object.entries(timeAnalysis).map(([slot, stats]) => ({
    slot,
    rate: stats.total > 0 ? (stats.taken / stats.total) * 100 : 0
  }));

  const bestTimeSlot = timeRates.reduce((best, current) => current.rate > best.rate ? current : best, timeRates[0])?.slot || '';
  const worstTimeSlot = timeRates.reduce((worst, current) => current.rate < worst.rate ? current : worst, timeRates[0])?.slot || '';

  // Supply issues
  const supplyIssues = medicationBreakdown
    .filter(med => med.supplyDaysLeft !== undefined && med.supplyDaysLeft <= 7)
    .map(med => `${med.name}: ${med.supplyDaysLeft} days left`);

  return {
    reportPeriod: { startDate, endDate, totalDays },
    overallMetrics: {
      totalDoses,
      takenDoses,
      missedDoses,
      adherenceRate: Math.round(adherenceRate * 100) / 100,
      averageDelay: Math.round(averageDelay),
      onTimeRate: Math.round(onTimeRate * 100) / 100,
      lateRate: Math.round(lateRate * 100) / 100,
      earlyRate: Math.round(earlyRate * 100) / 100
    },
    medicationBreakdown,
    timePatterns: {
      bestDay,
      worstDay,
      bestTimeSlot,
      worstTimeSlot
    },
    trends: {
      improvingAdherence: false, // Could be calculated with more complex analysis
      consistentTiming: Math.abs(averageDelay) <= 15,
      supplyIssues
    }
  };
};

/**
 * Generate a comprehensive summary CSV with overall statistics
 */
export const generateSummaryReport = (adherenceData: MedicationAdherenceData[], dailyData: DailyAdherenceSummary[]): string => {
  const stats = calculateOverallStats(adherenceData);
  
  const sections = [
    ['MEDICATION ADHERENCE REPORT'],
    ['Generated:', new Date().toLocaleString()],
    [''],
    
    ['REPORT PERIOD'],
    ['Start Date:', stats.reportPeriod.startDate],
    ['End Date:', stats.reportPeriod.endDate],
    ['Total Days:', stats.reportPeriod.totalDays.toString()],
    [''],
    
    ['OVERALL METRICS'],
    ['Total Scheduled Doses:', stats.overallMetrics.totalDoses.toString()],
    ['Doses Taken:', stats.overallMetrics.takenDoses.toString()],
    ['Doses Missed:', stats.overallMetrics.missedDoses.toString()],
    ['Overall Adherence Rate:', `${stats.overallMetrics.adherenceRate}%`],
    ['Average Delay:', `${stats.overallMetrics.averageDelay} minutes`],
    ['On-Time Rate:', `${stats.overallMetrics.onTimeRate}%`],
    ['Late Rate:', `${stats.overallMetrics.lateRate}%`],
    ['Early Rate:', `${stats.overallMetrics.earlyRate}%`],
    [''],
    
    ['MEDICATION BREAKDOWN'],
    ['Medication', 'Adherence Rate', 'Taken/Total', 'Supply Days Left'],
    ...stats.medicationBreakdown.map(med => [
      med.name,
      `${med.adherenceRate.toFixed(1)}%`,
      `${med.takenDoses}/${med.totalDoses}`,
      med.supplyDaysLeft?.toString() || 'N/A'
    ]),
    [''],
    
    ['TIME PATTERNS'],
    ['Best Day of Week:', stats.timePatterns.bestDay],
    ['Worst Day of Week:', stats.timePatterns.worstDay],
    ['Best Time Slot:', stats.timePatterns.bestTimeSlot],
    ['Worst Time Slot:', stats.timePatterns.worstTimeSlot],
    [''],
    
    ['RECOMMENDATIONS'],
    ...(stats.overallMetrics.adherenceRate < 80 ? [['Consider setting additional reminders or consulting your healthcare provider']] : []),
    ...(stats.overallMetrics.lateRate > 30 ? [['Try adjusting reminder times to better fit your schedule']] : []),
    ...(stats.trends.supplyIssues.length > 0 ? [['Supply Issues:', ...stats.trends.supplyIssues]] : []),
    ...(stats.trends.consistentTiming ? [['Good job maintaining consistent timing!']] : [['Consider working on more consistent dosing times']]),
    [''],
    
    ['PERFECT ADHERENCE DAYS'],
    [`Total: ${dailyData.filter(d => d.perfectAdherenceDays).length} out of ${dailyData.length} days`],
    [`Percentage: ${((dailyData.filter(d => d.perfectAdherenceDays).length / dailyData.length) * 100).toFixed(1)}%`]
  ];

  return sections.map(section => section.join(',')).join('\n');
};
