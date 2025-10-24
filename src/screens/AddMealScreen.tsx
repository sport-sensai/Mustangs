// Add meal screen - review photo and add details
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { Meal, Macros } from '../types';
import { analyzeMealPhoto } from '../services/foodRecognition';
import { saveMeal, getTodaysMeals } from '../services/storage';
import MealNumberSelector from '../components/MealNumberSelector';
import { format } from 'date-fns';

interface AddMealScreenProps {
  navigation: any;
  route: any;
}

/**
 * Screen for adding meal details after photo capture
 * Auto-analyzes photo and allows user to review/adjust
 */
export default function AddMealScreen({ navigation, route }: AddMealScreenProps) {
  const { photoUri } = route.params;

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [macros, setMacros] = useState<Macros>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [mealNumber, setMealNumber] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [notes, setNotes] = useState('');
  const [usedMealNumbers, setUsedMealNumbers] = useState<number[]>([]);
  const [detectedFoods, setDetectedFoods] = useState<string[]>([]);

  useEffect(() => {
    loadUsedMealNumbers();
    analyzePhoto();
  }, []);

  const loadUsedMealNumbers = async () => {
    const todaysMeals = await getTodaysMeals();
    const used = todaysMeals.map(m => m.mealNumber);
    setUsedMealNumbers(used);

    // Auto-select next available meal number
    for (let i = 1; i <= 6; i++) {
      if (!used.includes(i)) {
        setMealNumber(i as 1 | 2 | 3 | 4 | 5 | 6);
        break;
      }
    }
  };

  const analyzePhoto = async () => {
    try {
      setIsAnalyzing(true);
      const result = await analyzeMealPhoto(photoUri);

      setMacros(result.macros);
      setDetectedFoods(result.foods.map(f => f.name));
    } catch (error) {
      console.error('Error analyzing photo:', error);
      Alert.alert('Analysis Error', 'Could not analyze meal. Using default values.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const meal: Meal = {
        id: Date.now().toString(),
        mealNumber,
        photoUri,
        macros,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        foodItems: detectedFoods.length > 0 ? detectedFoods : undefined,
      };

      await saveMeal(meal);

      Alert.alert('Success', 'Meal logged successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
      setIsSaving(false);
    }
  };

  const handleAdjustMacros = (key: keyof Macros, delta: number) => {
    setMacros(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  if (isAnalyzing) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={{ uri: photoUri }} style={styles.loadingImage} />
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your meal...</Text>
          <Text style={styles.loadingSubtext}>
            Identifying food items and calculating nutrition
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Meal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Photo Preview */}
        <Image source={{ uri: photoUri }} style={styles.photo} />

        {/* Detected Foods */}
        {detectedFoods.length > 0 && (
          <View style={styles.detectedFoods}>
            <Text style={styles.detectedFoodsLabel}>Detected:</Text>
            <Text style={styles.detectedFoodsText}>{detectedFoods.join(', ')}</Text>
          </View>
        )}

        {/* Meal Number Selector */}
        <MealNumberSelector
          selectedMealNumber={mealNumber}
          onSelectMealNumber={setMealNumber}
          usedMealNumbers={usedMealNumbers}
        />

        {/* Macros Display with Adjustment */}
        <View style={styles.macrosSection}>
          <Text style={styles.sectionTitle}>Nutritional Information</Text>
          <Text style={styles.sectionSubtitle}>Tap +/- to adjust if needed</Text>

          <MacroAdjuster
            label="Calories"
            value={macros.calories}
            unit=""
            color={COLORS.primary}
            onIncrease={() => handleAdjustMacros('calories', 50)}
            onDecrease={() => handleAdjustMacros('calories', -50)}
          />
          <MacroAdjuster
            label="Protein"
            value={macros.protein}
            unit="g"
            color={COLORS.secondary}
            onIncrease={() => handleAdjustMacros('protein', 5)}
            onDecrease={() => handleAdjustMacros('protein', -5)}
          />
          <MacroAdjuster
            label="Carbs"
            value={macros.carbs}
            unit="g"
            color={COLORS.accent}
            onIncrease={() => handleAdjustMacros('carbs', 10)}
            onDecrease={() => handleAdjustMacros('carbs', -10)}
          />
          <MacroAdjuster
            label="Fat"
            value={macros.fat}
            unit="g"
            color={COLORS.textSecondary}
            onIncrease={() => handleAdjustMacros('fat', 5)}
            onDecrease={() => handleAdjustMacros('fat', -5)}
          />
        </View>

        {/* Notes Input */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about this meal..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            maxLength={200}
          />
          <Text style={styles.characterCount}>{notes.length}/200</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <MaterialIcons name="check" size={24} color={COLORS.surface} />
              <Text style={styles.saveButtonText}>Save Meal</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface MacroAdjusterProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  onIncrease: () => void;
  onDecrease: () => void;
}

function MacroAdjuster({ label, value, unit, color, onIncrease, onDecrease }: MacroAdjusterProps) {
  return (
    <View style={styles.macroAdjuster}>
      <View style={styles.macroAdjusterLeft}>
        <Text style={styles.macroAdjusterLabel}>{label}</Text>
        <View style={styles.macroAdjusterValue}>
          <Text style={[styles.macroAdjusterValueText, { color }]}>
            {value}
            {unit}
          </Text>
        </View>
      </View>
      <View style={styles.macroAdjusterButtons}>
        <TouchableOpacity style={styles.adjustButton} onPress={onDecrease}>
          <MaterialIcons name="remove" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.adjustButton} onPress={onIncrease}>
          <MaterialIcons name="add" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#000',
  },
  loadingImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.surface,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.surface,
    opacity: 0.8,
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
    paddingBottom: 40,
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.border,
  },
  detectedFoods: {
    padding: 16,
    backgroundColor: COLORS.primary + '15',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detectedFoodsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detectedFoodsText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  macrosSection: {
    padding: 20,
    backgroundColor: COLORS.surface,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  macroAdjuster: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  macroAdjusterLeft: {
    flex: 1,
  },
  macroAdjusterLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  macroAdjusterValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  macroAdjusterValueText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  macroAdjusterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesSection: {
    padding: 20,
    backgroundColor: COLORS.surface,
    marginTop: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
