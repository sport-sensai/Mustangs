// Meal number selector component (1-6)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, MEAL_NUMBERS } from '../constants';

interface MealNumberSelectorProps {
  selectedMealNumber: number;
  onSelectMealNumber: (mealNumber: 1 | 2 | 3 | 4 | 5 | 6) => void;
  usedMealNumbers?: number[];
}

/**
 * Large, touch-friendly selector for meal numbers
 * Shows which meals have already been logged today
 */
export default function MealNumberSelector({
  selectedMealNumber,
  onSelectMealNumber,
  usedMealNumbers = [],
}: MealNumberSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Which meal is this?</Text>
      <View style={styles.grid}>
        {MEAL_NUMBERS.map(num => {
          const isSelected = selectedMealNumber === num;
          const isUsed = usedMealNumbers.includes(num);
          const mealColor = getMealColor(num);

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.button,
                isSelected && { backgroundColor: mealColor, borderColor: mealColor },
                isUsed && !isSelected && styles.usedButton,
              ]}
              onPress={() => onSelectMealNumber(num as 1 | 2 | 3 | 4 | 5 | 6)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.buttonText,
                  isSelected && styles.selectedButtonText,
                  isUsed && !isSelected && styles.usedButtonText,
                ]}
              >
                {num}
              </Text>
              {isUsed && !isSelected && <View style={styles.checkmark}>✓</View>}
            </TouchableOpacity>
          );
        })}
      </View>
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
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
  },
  usedButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  selectedButtonText: {
    color: COLORS.surface,
  },
  usedButtonText: {
    color: COLORS.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 12,
  },
});
