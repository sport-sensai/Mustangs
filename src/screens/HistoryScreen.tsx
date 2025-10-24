// History screen - view past meals and summaries
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { DailySummary } from '../types';
import { getDailySummaries } from '../services/storage';
import DailySummaryCard from '../components/DailySummaryCard';
import MealCard from '../components/MealCard';
import { format, subDays } from 'date-fns';

interface HistoryScreenProps {
  navigation: any;
}

/**
 * History screen showing past days' meals
 */
export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);

      // Load last 30 days
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

      const data = await getDailySummaries(startDate, endDate);
      setSummaries(data.reverse()); // Most recent first
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {summaries.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={64} color={COLORS.border} />
            <Text style={styles.emptyStateText}>No history yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Your meal history will appear here
            </Text>
          </View>
        ) : (
          summaries.map(summary => (
            <View key={summary.date} style={styles.daySummary}>
              <TouchableOpacity
                style={styles.summaryHeader}
                onPress={() => toggleExpanded(summary.date)}
                activeOpacity={0.7}
              >
                <DailySummaryCard summary={summary} showDate />
                <MaterialIcons
                  name={expandedDate === summary.date ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={COLORS.text}
                  style={styles.expandIcon}
                />
              </TouchableOpacity>

              {expandedDate === summary.date && (
                <View style={styles.mealsContainer}>
                  {summary.meals.map(meal => (
                    <MealCard key={meal.id} meal={meal} compact />
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  daySummary: {
    marginBottom: 16,
  },
  summaryHeader: {
    position: 'relative',
  },
  expandIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  mealsContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
});
