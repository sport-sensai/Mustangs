// Core data types for the meal tracking app

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  mealNumber: 1 | 2 | 3 | 4 | 5 | 6;
  photoUri: string;
  macros: Macros;
  notes?: string;
  timestamp: string;
  date: string; // YYYY-MM-DD format
  foodItems?: string[]; // Detected food items
}

export interface DailySummary {
  date: string;
  totalMacros: Macros;
  meals: Meal[];
  mealCount: number;
}

export interface FoodRecognitionResponse {
  foods: Array<{
    name: string;
    confidence: number;
  }>;
  macros: Macros;
}
