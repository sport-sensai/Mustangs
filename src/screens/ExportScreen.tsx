// Export screen - share data to Google Sheets
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { DailySummary } from '../types';
import { getDailySummaries, getTodaysSummary } from '../services/storage';
import { exportToCSV, shareTextSummary } from '../services/googleSheets';
import { format, subDays } from 'date-fns';

interface ExportScreenProps {
  navigation: any;
}

/**
 * Export screen for sharing nutrition data
 */
export default function ExportScreen({ navigation }: ExportScreenProps) {
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const summary = await getTodaysSummary();
      setTodaySummary(summary);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToday = async () => {
    if (!todaySummary || todaySummary.meals.length === 0) {
      Alert.alert('No Data', 'You haven\'t logged any meals today.');
      return;
    }

    try {
      setIsExporting(true);
      await exportToCSV([todaySummary], { includeNotes: true, includeMealDetails: true });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWeek = async () => {
    try {
      setIsExporting(true);

      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');

      const summaries = await getDailySummaries(startDate, endDate);

      if (summaries.length === 0) {
        Alert.alert('No Data', 'No meals logged in the past week.');
        return;
      }

      await exportToCSV(summaries, { includeNotes: true, includeMealDetails: true });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMonth = async () => {
    try {
      setIsExporting(true);

      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      const summaries = await getDailySummaries(startDate, endDate);

      if (summaries.length === 0) {
        Alert.alert('No Data', 'No meals logged in the past month.');
        return;
      }

      await exportToCSV(summaries, { includeNotes: true, includeMealDetails: true });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToday = async () => {
    if (!todaySummary || todaySummary.meals.length === 0) {
      Alert.alert('No Data', 'You haven\'t logged any meals today.');
      return;
    }

    try {
      await shareTextSummary(todaySummary);
    } catch (error) {
      Alert.alert('Share Failed', 'Could not share summary. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export & Share</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export to CSV</Text>
          <Text style={styles.sectionDescription}>
            Export your nutrition data to a CSV file that can be imported into Google Sheets,
            Excel, or shared with your coach.
          </Text>

          <ExportButton
            icon="today"
            title="Export Today"
            description="Export today's meals only"
            onPress={handleExportToday}
            disabled={isExporting || !todaySummary || todaySummary.meals.length === 0}
          />

          <ExportButton
            icon="date-range"
            title="Export Past 7 Days"
            description="Export the last week of meals"
            onPress={handleExportWeek}
            disabled={isExporting}
          />

          <ExportButton
            icon="calendar-today"
            title="Export Past 30 Days"
            description="Export the last month of meals"
            onPress={handleExportMonth}
            disabled={isExporting}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Share</Text>
          <Text style={styles.sectionDescription}>
            Share today's summary as a text message or via other apps.
          </Text>

          <ExportButton
            icon="share"
            title="Share Today's Summary"
            description="Share as text via Messages, WhatsApp, etc."
            onPress={handleShareToday}
            disabled={!todaySummary || todaySummary.meals.length === 0}
          />
        </View>

        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color={COLORS.secondary} />
          <Text style={styles.infoText}>
            CSV files can be opened in Google Sheets, Excel, or Numbers. Simply upload the file
            or open it directly from your downloads.
          </Text>
        </View>
      </ScrollView>

      {isExporting && (
        <View style={styles.exportingOverlay}>
          <View style={styles.exportingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.exportingText}>Preparing export...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

interface ExportButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

function ExportButton({ icon, title, description, onPress, disabled }: ExportButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.exportButton, disabled && styles.exportButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.exportButtonIcon}>
        <MaterialIcons
          name={icon}
          size={24}
          color={disabled ? COLORS.textSecondary : COLORS.primary}
        />
      </View>
      <View style={styles.exportButtonContent}>
        <Text style={[styles.exportButtonTitle, disabled && styles.exportButtonTitleDisabled]}>
          {title}
        </Text>
        <Text style={styles.exportButtonDescription}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={COLORS.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 24,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportButtonContent: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  exportButtonTitleDisabled: {
    color: COLORS.textSecondary,
  },
  exportButtonDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary + '10',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginLeft: 12,
  },
  exportingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportingCard: {
    backgroundColor: COLORS.surface,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  exportingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
