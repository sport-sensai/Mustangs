// Google Sheets export service
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DailySummary } from '../types';
import { format } from 'date-fns';

/**
 * Export daily summary to CSV format that can be imported to Google Sheets
 *
 * The CSV format is optimized for coach/parent viewing:
 * - Clear column headers
 * - Daily totals at the top
 * - Individual meals below
 * - Easy to import into existing tracking spreadsheets
 */

export interface ExportOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  includeNotes?: boolean;
  includeMealDetails?: boolean;
}

/**
 * Generate CSV content from daily summaries
 */
export function generateCSV(
  summaries: DailySummary[],
  options: ExportOptions = {}
): string {
  const { includeNotes = true, includeMealDetails = true } = options;

  let csv = '';

  // Header for summary section
  csv += 'DAILY NUTRITION SUMMARY\n';
  csv += 'Date,Total Calories,Total Protein (g),Total Carbs (g),Total Fat (g),Meals Logged\n';

  // Add daily totals
  summaries.forEach(summary => {
    const { date, totalMacros, mealCount } = summary;
    csv += `${date},${totalMacros.calories},${totalMacros.protein},${totalMacros.carbs},${totalMacros.fat},${mealCount}\n`;
  });

  // Add detailed meal breakdown if requested
  if (includeMealDetails) {
    csv += '\n\nDETAILED MEAL BREAKDOWN\n';
    csv += includeNotes
      ? 'Date,Meal #,Time,Calories,Protein (g),Carbs (g),Fat (g),Notes\n'
      : 'Date,Meal #,Time,Calories,Protein (g),Carbs (g),Fat (g)\n';

    summaries.forEach(summary => {
      summary.meals.forEach(meal => {
        const time = format(new Date(meal.timestamp), 'HH:mm');
        const notes = meal.notes || '';

        csv += includeNotes
          ? `${meal.date},${meal.mealNumber},${time},${meal.macros.calories},${meal.macros.protein},${meal.macros.carbs},${meal.macros.fat},"${notes}"\n`
          : `${meal.date},${meal.mealNumber},${time},${meal.macros.calories},${meal.macros.protein},${meal.macros.carbs},${meal.macros.fat}\n`;
      });
    });
  }

  return csv;
}

/**
 * Export to CSV file and share
 */
export async function exportToCSV(
  summaries: DailySummary[],
  options: ExportOptions = {}
): Promise<void> {
  try {
    const csv = generateCSV(summaries, options);

    // Generate filename with date range
    const startDate = summaries[0]?.date || format(new Date(), 'yyyy-MM-dd');
    const endDate = summaries[summaries.length - 1]?.date || startDate;
    const filename = `meal-tracking-${startDate}-to-${endDate}.csv`;

    // Save to temporary file
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Nutrition Data',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

/**
 * Generate a formatted text summary for quick sharing
 */
export function generateTextSummary(summary: DailySummary): string {
  const { date, totalMacros, mealCount } = summary;

  let text = `Nutrition Summary - ${date}\n`;
  text += `${'='.repeat(40)}\n\n`;
  text += `Meals Logged: ${mealCount}/6\n\n`;
  text += `TOTALS:\n`;
  text += `  Calories: ${totalMacros.calories}\n`;
  text += `  Protein:  ${totalMacros.protein}g\n`;
  text += `  Carbs:    ${totalMacros.carbs}g\n`;
  text += `  Fat:      ${totalMacros.fat}g\n\n`;

  text += `MEALS:\n`;
  summary.meals.forEach(meal => {
    const time = format(new Date(meal.timestamp), 'h:mm a');
    text += `  Meal ${meal.mealNumber} (${time}):\n`;
    text += `    ${meal.macros.calories} cal | ${meal.macros.protein}g P | ${meal.macros.carbs}g C | ${meal.macros.fat}g F\n`;
    if (meal.notes) {
      text += `    Note: ${meal.notes}\n`;
    }
  });

  return text;
}

/**
 * Share text summary via native share sheet
 */
export async function shareTextSummary(summary: DailySummary): Promise<void> {
  const text = generateTextSummary(summary);

  if (await Sharing.isAvailableAsync()) {
    const fileUri = FileSystem.documentDirectory + `summary-${summary.date}.txt`;
    await FileSystem.writeAsStringAsync(fileUri, text, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: 'Share Daily Summary',
    });
  }
}
