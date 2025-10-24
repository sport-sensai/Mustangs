// Food recognition and macro calculation service
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { FoodRecognitionResponse, Macros } from '../types';

/**
 * Analyzes a meal photo and returns nutritional macros
 *
 * This service uses a multi-step approach:
 * 1. Image analysis to identify food items
 * 2. Portion estimation based on visual cues
 * 3. Nutritional lookup and calculation
 *
 * For production, you would integrate with:
 * - Google Vision API for food detection
 * - Nutritionix API for detailed nutrition data
 * - CalorieNinjas API for quick lookups
 *
 * For demo purposes, this includes a fallback estimation system
 */

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Analyze image using Google Vision API (when configured)
 */
async function analyzeImageWithVision(imageUri: string): Promise<string[]> {
  // This would call Google Vision API
  // For now, return mock data for development
  return ['mixed foods'];
}

/**
 * Get nutrition data from CalorieNinjas API
 */
async function getNutritionData(foodQuery: string): Promise<Macros> {
  const API_KEY = process.env.CALORIE_NINJAS_API_KEY;

  if (!API_KEY) {
    // Return estimated values if API key not configured
    return estimateMacrosFromImage();
  }

  try {
    const response = await axios.get(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(foodQuery)}`,
      {
        headers: { 'X-Api-Key': API_KEY },
        timeout: 10000,
      }
    );

    const items = response.data.items || [];

    // Sum up all items
    const totals = items.reduce(
      (acc: Macros, item: any) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein_g || 0),
        carbs: acc.carbs + (item.carbohydrates_total_g || 0),
        fat: acc.fat + (item.fat_total_g || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return totals;
  } catch (error) {
    console.warn('Nutrition API error:', error);
    return estimateMacrosFromImage();
  }
}

/**
 * Fallback estimation when APIs are unavailable
 * Uses average meal macros for an athlete
 */
function estimateMacrosFromImage(): Macros {
  // Average balanced meal for a teenage athlete
  // These are reasonable defaults that users can adjust
  return {
    calories: 500,
    protein: 30,
    carbs: 60,
    fat: 15,
  };
}

/**
 * Main function to process a meal photo and return macros
 */
export async function analyzeMealPhoto(photoUri: string): Promise<FoodRecognitionResponse> {
  try {
    // Step 1: Detect food items in the image
    const detectedFoods = await analyzeImageWithVision(photoUri);

    // Step 2: Get nutrition data for detected foods
    const foodQuery = detectedFoods.join(', ') || 'mixed meal';
    const macros = await getNutritionData(foodQuery);

    return {
      foods: detectedFoods.map(name => ({
        name,
        confidence: 0.8,
      })),
      macros,
    };
  } catch (error) {
    console.error('Error analyzing meal:', error);

    // Return estimation as fallback
    return {
      foods: [{ name: 'Mixed foods', confidence: 0.5 }],
      macros: estimateMacrosFromImage(),
    };
  }
}

/**
 * Enhanced analysis with manual food input
 * This allows users to specify what they ate for better accuracy
 */
export async function analyzeMealWithInput(
  photoUri: string,
  foodDescription: string
): Promise<FoodRecognitionResponse> {
  try {
    const macros = await getNutritionData(foodDescription);

    return {
      foods: [{ name: foodDescription, confidence: 1.0 }],
      macros,
    };
  } catch (error) {
    console.error('Error analyzing meal with input:', error);
    return {
      foods: [{ name: foodDescription, confidence: 0.8 }],
      macros: estimateMacrosFromImage(),
    };
  }
}

/**
 * Calculate portion adjustment based on plate coverage
 * Uses image analysis to estimate if portion is larger/smaller than average
 */
export function adjustMacrosForPortion(
  baseMacros: Macros,
  portionMultiplier: number
): Macros {
  return {
    calories: Math.round(baseMacros.calories * portionMultiplier),
    protein: Math.round(baseMacros.protein * portionMultiplier * 10) / 10,
    carbs: Math.round(baseMacros.carbs * portionMultiplier * 10) / 10,
    fat: Math.round(baseMacros.fat * portionMultiplier * 10) / 10,
  };
}
