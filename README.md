# MealTrack - Athlete Nutrition Tracker

A simple, intuitive mobile app designed for high school athletes to track their nutrition through meal photos. Built with speed and simplicity in mind.

## 🎯 Purpose

MealTrack helps athletes:
- Quickly log meals by taking photos
- Automatically calculate nutritional macros
- Track 6 meals per day with simple numbering (1-6)
- Export data to Google Sheets for coaches/parents
- Review daily and historical nutrition patterns

## ✨ Key Features

### 📸 Photo-First Tracking
- Snap a photo of your meal
- Auto-analyze for macros (calories, protein, carbs, fat)
- Manual adjustment available if needed
- Works offline - syncs when connected

### 🎨 Athlete-Friendly Design
- Large, touch-friendly buttons
- Color-coded meal numbers for quick identification
- At-a-glance daily summary
- No complex menus or confusing settings

### 📊 Smart Tracking
- 6-meal daily structure (Meal 1-6)
- Visual indicators for logged meals
- Daily totals automatically calculated
- Quick notes for context (optional)

### 📤 Easy Sharing
- Export to CSV for Google Sheets import
- Share daily summaries via text/email
- Perfect for coach/parent review
- Weekly and monthly export options

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Physical device for testing camera (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Mustangs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API keys (optional)**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys (see Configuration section)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator, `a` for Android emulator

## ⚙️ Configuration

### Food Recognition APIs (Optional)

The app works out-of-the-box with estimated macros. For better accuracy, configure one of these APIs:

#### Option 1: CalorieNinjas API (Recommended)
- Free tier: 100 requests/month
- Sign up: https://calorieninjas.com/api
- Add to `.env`: `CALORIE_NINJAS_API_KEY=your_key_here`

#### Option 2: Edamam Food Database API
- Free tier: 10,000 requests/month
- Sign up: https://developer.edamam.com/
- Add to `.env`:
  ```
  EDAMAM_APP_ID=your_app_id
  EDAMAM_APP_KEY=your_app_key
  ```

### Without API Keys
The app provides reasonable macro estimates based on average meal sizes. Athletes can manually adjust values for accuracy.

## 📱 How to Use

### Logging a Meal

1. **Tap the camera button** (green circle at bottom right)
2. **Take a photo** of your meal or select from gallery
3. **Wait for analysis** (2-3 seconds)
4. **Select meal number** (1-6) - app suggests next available
5. **Review macros** - adjust with +/- buttons if needed
6. **Add notes** (optional) - "pre-workout", "post-practice", etc.
7. **Save** - meal is added to today's total

### Viewing Progress

- **Home screen** shows today's totals and all logged meals
- **Pull down to refresh** data
- **Tap any meal** to view details
- **History button** (top right) shows past days

### Exporting Data

1. **Tap share button** (top right on home)
2. **Choose export option**:
   - Export Today (single day CSV)
   - Export Past 7 Days (weekly CSV)
   - Export Past 30 Days (monthly CSV)
   - Share Today's Summary (text format)
3. **Share via** AirDrop, email, Messages, etc.
4. **Import to Google Sheets** - open CSV file

## 🏗️ Project Structure

```
Mustangs/
├── App.tsx                 # Main app entry with navigation
├── src/
│   ├── screens/            # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── AddMealScreen.tsx
│   │   ├── MealDetailScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ExportScreen.tsx
│   ├── components/         # Reusable UI components
│   │   ├── MealCard.tsx
│   │   ├── DailySummaryCard.tsx
│   │   └── MealNumberSelector.tsx
│   ├── services/           # Business logic
│   │   ├── foodRecognition.ts
│   │   ├── googleSheets.ts
│   │   └── storage.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── constants/          # App constants
│       └── index.ts
├── assets/                 # Images, icons
└── package.json
```

## 🎨 Design Philosophy

### Built for Athletes
- **Speed over features** - log a meal in 10 seconds
- **Visual over text** - colors, icons, and large numbers
- **Minimal friction** - fewer taps, less typing
- **Forgiving** - estimates work, adjustments easy

### Target User: 15-Year-Old Athlete
- Limited patience for complex UIs
- High smartphone proficiency
- Time-constrained (school, practice, homework)
- Needs quick, in-the-moment tracking
- May share with coaches/parents

### Key Design Decisions
1. **Photo-first** - reduces manual entry burden
2. **Numbered meals (1-6)** - simpler than time-based categories
3. **Color coding** - each meal number has unique color
4. **Large touch targets** - minimum 44x44pt for buttons
5. **Offline-first** - works without internet
6. **No login required** - data stored locally

## 🔧 Technical Stack

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation
- **Storage**: AsyncStorage (local, persistent)
- **Camera**: Expo Camera
- **Styling**: React Native StyleSheet
- **Language**: TypeScript
- **Date handling**: date-fns

## 📊 Data Model

### Meal Object
```typescript
{
  id: string;              // Unique identifier
  mealNumber: 1-6;         // Which meal of the day
  photoUri: string;        // Local photo path
  macros: {
    calories: number;
    protein: number;       // grams
    carbs: number;         // grams
    fat: number;          // grams
  };
  notes?: string;          // Optional notes
  timestamp: string;       // ISO 8601 datetime
  date: string;           // YYYY-MM-DD
  foodItems?: string[];   // Detected foods
}
```

### Daily Summary
```typescript
{
  date: string;           // YYYY-MM-DD
  totalMacros: Macros;    // Sum of all meals
  meals: Meal[];          // Array of meals
  mealCount: number;      // How many logged
}
```

## 🚧 Future Enhancements

### Short-term (v2.0)
- [ ] Meal templates for common foods
- [ ] Water intake tracking
- [ ] Streak tracking for motivation
- [ ] Dark mode support

### Medium-term (v3.0)
- [ ] Barcode scanning for packaged foods
- [ ] Custom macro goals by athlete
- [ ] Weekly trend charts
- [ ] Coach collaboration features

### Long-term (v4.0)
- [ ] Integration with fitness trackers
- [ ] Training day vs. rest day tracking
- [ ] Meal plan suggestions
- [ ] Social features for teams

## 🤝 Contributing

This is a personal project for athlete nutrition tracking. Contributions welcome!

## 📄 License

MIT License - feel free to use for personal or educational purposes.

## 🐛 Troubleshooting

### Camera not working
- Check permissions in phone settings
- Grant camera access when prompted
- On iOS: Settings > Privacy > Camera > MealTrack
- On Android: Settings > Apps > MealTrack > Permissions

### Export not working
- Ensure you've logged at least one meal
- Check that sharing is available on your device
- Try restarting the app

### Macros seem inaccurate
- API may not recognize food correctly
- Use +/- buttons to adjust values
- Consider configuring a food recognition API
- Take clearer photos with good lighting

### App crashes on startup
- Clear app data and restart
- Reinstall via Expo Go
- Check console for errors: `npx expo start --dev-client`

## 📞 Support

For issues or questions:
1. Check this README
2. Review error messages in console
3. Open an issue on GitHub

## 🙏 Acknowledgments

- Built with Expo and React Native
- Icons by MaterialIcons (@expo/vector-icons)
- Nutrition data from CalorieNinjas API
- Inspired by the needs of student athletes everywhere
