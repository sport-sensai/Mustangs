// Local storage service for meal data
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, DailySummary, Macros } from '../types';
import { STORAGE_KEYS } from '../constants';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';

/**
 * Storage service for persisting meal data locally
 * Uses AsyncStorage for offline-first functionality
 */

/**
 * Save a new meal
 */
export async function saveMeal(meal: Meal): Promise<void> {
  try {
    const meals = await getAllMeals();
    meals.push(meal);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
}

/**
 * Get all meals
 */
export async function getAllMeals(): Promise<Meal[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting meals:', error);
    return [];
  }
}

/**
 * Get meals for a specific date
 */
export async function getMealsForDate(date: string): Promise<Meal[]> {
  try {
    const allMeals = await getAllMeals();
    return allMeals.filter(meal => meal.date === date);
  } catch (error) {
    console.error('Error getting meals for date:', error);
    return [];
  }
}

/**
 * Get meals for today
 */
export async function getTodaysMeals(): Promise<Meal[]> {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getMealsForDate(today);
}

/**
 * Update an existing meal
 */
export async function updateMeal(updatedMeal: Meal): Promise<void> {
  try {
    const meals = await getAllMeals();
    const index = meals.findIndex(m => m.id === updatedMeal.id);

    if (index !== -1) {
      meals[index] = updatedMeal;
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    } else {
      throw new Error('Meal not found');
    }
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
}

/**
 * Delete a meal
 */
export async function deleteMeal(mealId: string): Promise<void> {
  try {
    const meals = await getAllMeals();
    const filtered = meals.filter(m => m.id !== mealId);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}

/**
 * Calculate daily summary for a specific date
 */
export async function getDailySummary(date: string): Promise<DailySummary> {
  const meals = await getMealsForDate(date);

  const totalMacros: Macros = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.macros.calories,
      protein: Math.round((acc.protein + meal.macros.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + meal.macros.carbs) * 10) / 10,
      fat: Math.round((acc.fat + meal.macros.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    date,
    totalMacros,
    meals: meals.sort((a, b) => a.mealNumber - b.mealNumber),
    mealCount: meals.length,
  };
}

/**
 * Get daily summaries for a date range
 */
export async function getDailySummaries(
  startDate: string,
  endDate: string
): Promise<DailySummary[]> {
  const allMeals = await getAllMeals();
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // Group meals by date
  const mealsByDate: { [key: string]: Meal[] } = {};

  allMeals.forEach(meal => {
    const mealDate = parseISO(meal.date);
    if (mealDate >= start && mealDate <= end) {
      if (!mealsByDate[meal.date]) {
        mealsByDate[meal.date] = [];
      }
      mealsByDate[meal.date].push(meal);
    }
  });

  // Create summaries for each date
  const summaries: DailySummary[] = [];

  Object.keys(mealsByDate)
    .sort()
    .forEach(date => {
      const meals = mealsByDate[date];
      const totalMacros = meals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.macros.calories,
          protein: Math.round((acc.protein + meal.macros.protein) * 10) / 10,
          carbs: Math.round((acc.carbs + meal.macros.carbs) * 10) / 10,
          fat: Math.round((acc.fat + meal.macros.fat) * 10) / 10,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      summaries.push({
        date,
        totalMacros,
        meals: meals.sort((a, b) => a.mealNumber - b.mealNumber),
        mealCount: meals.length,
      });
    });

  return summaries;
}

/**
 * Get today's summary
 */
export async function getTodaysSummary(): Promise<DailySummary> {
  const today = format(new Date(), 'yyyy-MM-dd');
  return getDailySummary(today);
}

/**
 * Clear all meal data (for testing/reset)
 */
export async function clearAllMeals(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MEALS);
  } catch (error) {
    console.error('Error clearing meals:', error);
    throw error;
  }
}
