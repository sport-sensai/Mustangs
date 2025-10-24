// Meal detail screen - view individual meal details
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, MEAL_LABELS } from '../constants';
import { Meal } from '../types';
import { deleteMeal } from '../services/storage';
import { format } from 'date-fns';

interface MealDetailScreenProps {
  navigation: any;
  route: any;
}

/**
 * Detail view for a single meal
 */
export default function MealDetailScreen({ navigation, route }: MealDetailScreenProps) {
  const { meal } = route.params as { meal: Meal };

  const mealColor = getMealColor(meal.mealNumber);
  const time = format(new Date(meal.timestamp), 'h:mm a');
  const date = format(new Date(meal.timestamp), 'EEEE, MMMM d, yyyy');

  const handleDelete = () => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeal(meal.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <MaterialIcons name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Image source={{ uri: meal.photoUri }} style={styles.photo} />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <View style={[styles.mealBadge, { backgroundColor: mealColor }]}>
              <Text style={styles.mealBadgeText}>{meal.mealNumber}</Text>
            </View>
            <View style={styles.titleText}>
              <Text style={styles.mealLabel}>{MEAL_LABELS[meal.mealNumber]}</Text>
              <Text style={styles.dateTime}>{date}</Text>
              <Text style={styles.time}>{time}</Text>
            </View>
          </View>

          {meal.foodItems && meal.foodItems.length > 0 && (
            <View style={styles.foodItems}>
              <Text style={styles.foodItemsLabel}>Detected Foods</Text>
              <Text style={styles.foodItemsText}>{meal.foodItems.join(', ')}</Text>
            </View>
          )}

          <View style={styles.macrosSection}>
            <Text style={styles.sectionTitle}>Nutritional Information</Text>

            <View style={styles.macrosGrid}>
              <MacroCard
                label="Calories"
                value={meal.macros.calories.toString()}
                color={COLORS.primary}
                icon="local-fire-department"
              />
              <MacroCard
                label="Protein"
                value={`${meal.macros.protein}g`}
                color={COLORS.secondary}
                icon="fitness-center"
              />
              <MacroCard
                label="Carbs"
                value={`${meal.macros.carbs}g`}
                color={COLORS.accent}
                icon="grain"
              />
              <MacroCard
                label="Fat"
                value={`${meal.macros.fat}g`}
                color={COLORS.textSecondary}
                icon="opacity"
              />
            </View>
          </View>

          {meal.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{meal.notes}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface MacroCardProps {
  label: string;
  value: string;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

function MacroCard({ label, value, color, icon }: MacroCardProps) {
  return (
    <View style={styles.macroCard}>
      <View style={[styles.macroCardIcon, { backgroundColor: color + '15' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.macroCardValue, { color }]}>{value}</Text>
      <Text style={styles.macroCardLabel}>{label}</Text>
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
    flex: 1,
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
  photo: {
    width: '100%',
    height: 400,
    backgroundColor: COLORS.border,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  mealBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mealBadgeText: {
    color: COLORS.surface,
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleText: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  time: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  foodItems: {
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  foodItemsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  foodItemsText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  macrosSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  macroCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  macroCardLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesBox: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  notesText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
});
