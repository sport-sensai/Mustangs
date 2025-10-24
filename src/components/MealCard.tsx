// Meal card component for displaying individual meals
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Meal } from '../types';
import { COLORS, MEAL_LABELS } from '../constants';
import { format } from 'date-fns';

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
  compact?: boolean;
}

/**
 * Visual card for displaying a meal
 * Optimized for quick scanning with large numbers and color coding
 */
export default function MealCard({ meal, onPress, compact = false }: MealCardProps) {
  const mealColor = getMealColor(meal.mealNumber);
  const time = format(new Date(meal.timestamp), 'h:mm a');

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { borderLeftColor: mealColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactHeader}>
          <View style={[styles.mealBadge, { backgroundColor: mealColor }]}>
            <Text style={styles.mealBadgeText}>{meal.mealNumber}</Text>
          </View>
          <Text style={styles.compactTime}>{time}</Text>
        </View>
        <View style={styles.compactMacros}>
          <MacroItem label="Cal" value={meal.macros.calories} />
          <MacroItem label="P" value={`${meal.macros.protein}g`} />
          <MacroItem label="C" value={`${meal.macros.carbs}g`} />
          <MacroItem label="F" value={`${meal.macros.fat}g`} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderTopColor: mealColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: meal.photoUri }} style={styles.image} />
        <View style={[styles.mealBadge, { backgroundColor: mealColor }]}>
          <Text style={styles.mealBadgeText}>{meal.mealNumber}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.mealLabel}>{MEAL_LABELS[meal.mealNumber]}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <View style={styles.macrosGrid}>
          <MacroBox label="Calories" value={meal.macros.calories} color={COLORS.primary} />
          <MacroBox label="Protein" value={`${meal.macros.protein}g`} color={COLORS.secondary} />
          <MacroBox label="Carbs" value={`${meal.macros.carbs}g`} color={COLORS.accent} />
          <MacroBox label="Fat" value={`${meal.macros.fat}g`} color={COLORS.textSecondary} />
        </View>

        {meal.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notes} numberOfLines={2}>
              {meal.notes}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Helper component for macro display
function MacroBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={styles.macroBox}>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function MacroItem({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroItemValue}>{value}</Text>
      <Text style={styles.macroItemLabel}>{label}</Text>
    </View>
  );
}

function getMealColor(mealNumber: number): string {
  const colors: { [key: number]: string } = {
    1: COLORS.meal1,
    2: COLORS.meal2,
    3: COLORS.meal3,
    4: COLORS.meal4,
    5: COLORS.meal5,
    6: COLORS.meal6,
  };
  return colors[mealNumber] || COLORS.primary;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 4,
  },
  compactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },
  mealBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  mealBadgeText: {
    color: COLORS.surface,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  time: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  macroBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  compactMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  macroItemLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
});
