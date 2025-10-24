// Daily summary card showing totals
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailySummary } from '../types';
import { COLORS } from '../constants';
import { format, parseISO } from 'date-fns';

interface DailySummaryCardProps {
  summary: DailySummary;
  showDate?: boolean;
}

/**
 * Large, bold summary card for daily totals
 * Designed for quick at-a-glance viewing
 */
export default function DailySummaryCard({
  summary,
  showDate = false,
}: DailySummaryCardProps) {
  const { totalMacros, mealCount, date } = summary;
  const mealsRemaining = 6 - mealCount;

  return (
    <View style={styles.card}>
      {showDate && (
        <Text style={styles.date}>{format(parseISO(date), 'EEEE, MMM d')}</Text>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Today's Totals</Text>
        <View style={styles.mealProgress}>
          <Text style={styles.mealCount}>{mealCount}/6</Text>
          <Text style={styles.mealLabel}>meals</Text>
        </View>
      </View>

      <View style={styles.macrosContainer}>
        <MacroCircle
          label="Calories"
          value={totalMacros.calories}
          color={COLORS.primary}
          size="large"
        />

        <View style={styles.macrosGrid}>
          <MacroCircle label="Protein" value={`${totalMacros.protein}g`} color={COLORS.secondary} />
          <MacroCircle label="Carbs" value={`${totalMacros.carbs}g`} color={COLORS.accent} />
          <MacroCircle label="Fat" value={`${totalMacros.fat}g`} color={COLORS.textSecondary} />
        </View>
      </View>

      {mealsRemaining > 0 && (
        <View style={styles.reminder}>
          <Text style={styles.reminderText}>
            {mealsRemaining} meal{mealsRemaining > 1 ? 's' : ''} remaining today
          </Text>
        </View>
      )}
    </View>
  );
}

function MacroCircle({
  label,
  value,
  color,
  size = 'normal',
}: {
  label: string;
  value: string | number;
  color: string;
  size?: 'normal' | 'large';
}) {
  const isLarge = size === 'large';

  return (
    <View style={isLarge ? styles.macroCircleLarge : styles.macroCircle}>
      <View
        style={[
          isLarge ? styles.circleContainerLarge : styles.circleContainer,
          { backgroundColor: color + '15' }, // 15 = ~10% opacity
        ]}
      >
        <Text style={[isLarge ? styles.macroValueLarge : styles.macroValue, { color }]}>
          {value}
        </Text>
      </View>
      <Text style={isLarge ? styles.macroLabelLarge : styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mealProgress: {
    alignItems: 'center',
  },
  mealCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  mealLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  macrosContainer: {
    alignItems: 'center',
  },
  macroCircleLarge: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circleContainerLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroValueLarge: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  macroLabelLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  macroCircle: {
    alignItems: 'center',
    flex: 1,
  },
  circleContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  reminder: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
