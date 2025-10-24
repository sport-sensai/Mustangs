// App constants and configuration

export const MEAL_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

export const MEAL_LABELS = {
  1: 'Meal 1',
  2: 'Meal 2',
  3: 'Meal 3',
  4: 'Meal 4',
  5: 'Meal 5',
  6: 'Meal 6',
} as const;

// Color scheme optimized for quick visual scanning
export const COLORS = {
  primary: '#4CAF50',      // Green - active, healthy
  secondary: '#2196F3',    // Blue - calm, trustworthy
  accent: '#FF9800',       // Orange - energy, attention
  background: '#F5F5F5',   // Light gray
  surface: '#FFFFFF',      // White
  error: '#F44336',        // Red
  text: '#212121',         // Dark gray
  textSecondary: '#757575', // Medium gray
  border: '#E0E0E0',       // Light border
  success: '#4CAF50',      // Green

  // Meal number colors for quick identification
  meal1: '#FF5722',  // Red-orange (breakfast)
  meal2: '#FF9800',  // Orange (snack)
  meal3: '#FFC107',  // Amber (lunch)
  meal4: '#8BC34A',  // Light green (snack)
  meal5: '#4CAF50',  // Green (dinner)
  meal6: '#009688',  // Teal (evening snack)
};

export const STORAGE_KEYS = {
  MEALS: '@meals',
  SETTINGS: '@settings',
  GOOGLE_SHEETS_CONFIG: '@google_sheets_config',
};

// API Configuration (users will need to add their own keys)
export const API_CONFIG = {
  // Using CalorieNinjas API for food recognition
  // Free tier: 100 requests/month
  CALORIE_NINJAS_KEY: process.env.CALORIE_NINJAS_API_KEY || '',

  // Alternative: Edamam Food Database API
  EDAMAM_APP_ID: process.env.EDAMAM_APP_ID || '',
  EDAMAM_APP_KEY: process.env.EDAMAM_APP_KEY || '',
};
