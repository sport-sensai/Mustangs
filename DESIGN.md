# Design Philosophy - MealTrack

## User-Centered Design for Athletes

This document explains the design decisions made for MealTrack, optimized for a 15-year-old high school athlete.

## Core Principles

### 1. Speed Over Features
**Decision**: Minimize taps required to log a meal
**Reasoning**: Athletes are time-constrained between classes and practices
**Implementation**:
- Single FAB (Floating Action Button) for camera
- Photo → Review → Save in 3 screens
- Auto-suggest next meal number
- No login/signup required

### 2. Visual Over Text
**Decision**: Use colors, large numbers, and icons
**Reasoning**: Quick scanning is faster than reading
**Implementation**:
- Each meal number (1-6) has unique color
- Large, bold macro numbers
- Icons for all actions
- Minimal labels

### 3. Self-Explanatory Interface
**Decision**: No onboarding tutorials or help screens
**Reasoning**: Users won't read instructions
**Implementation**:
- Camera icon = take photo (universal)
- Numbered buttons (1-6) for meals
- +/- buttons for adjustments
- Share icon for export

### 4. Forgiveness
**Decision**: Allow easy corrections and adjustments
**Reasoning**: Estimates may be wrong, users make mistakes
**Implementation**:
- Manual macro adjustment with +/- buttons
- Swipe to delete meals
- Pull to refresh
- No confirmation for most actions

## Design Decisions by Screen

### Home Screen

**Layout**: Summary card → Meal list → FAB

**Key Decisions**:
1. **Daily summary at top** - Most important info first
2. **Circular macro displays** - Easy to scan
3. **Meal count (X/6)** - Progress indicator
4. **Large FAB** - Primary action always visible
5. **Pull to refresh** - Standard mobile pattern

**Colors**:
- Primary green (#4CAF50) - Active, healthy
- White cards - Clean, spacious
- Gray background - Reduces eye strain

### Camera Screen

**Layout**: Full-screen camera → Guide overlay → Controls

**Key Decisions**:
1. **Dashed guide box** - Shows where to frame meal
2. **Large capture button** - Easy to tap while holding phone
3. **Gallery button** - Alternative to camera
4. **Close button** - Clear exit

**UX Flow**:
```
Tap FAB → Camera opens → Center meal → Tap capture → Immediate analysis
```

### Add Meal Screen

**Layout**: Photo preview → Meal selector → Macros → Notes → Save

**Key Decisions**:
1. **Photo at top** - Visual confirmation
2. **Meal selector prominent** - Most important choice
3. **Adjustable macros** - Fine-tune if needed
4. **Optional notes** - Skip if in hurry
5. **Big save button** - Clear completion

**Interaction Design**:
- Meal numbers show checkmarks if already used
- Auto-select next available meal number
- +/- buttons use sensible increments (50 cal, 5g protein)
- Character counter for notes (200 max)

### History Screen

**Layout**: Expandable daily cards

**Key Decisions**:
1. **Most recent first** - Likely viewing recent data
2. **Collapsed by default** - Scannable overview
3. **Tap to expand** - See meal details
4. **Compact meal cards** - Fit more per screen

### Export Screen

**Layout**: Option cards with descriptions

**Key Decisions**:
1. **Multiple timeframes** - Today, week, month
2. **Clear descriptions** - Explain what each does
3. **Disabled states** - Can't export empty data
4. **Info box** - How to use CSV files

## Color System

### Meal Number Colors
Each meal has a distinct color for quick identification:

```
Meal 1: #FF5722 (Red-orange)  → Breakfast energy
Meal 2: #FF9800 (Orange)      → Morning snack
Meal 3: #FFC107 (Amber)       → Lunch warmth
Meal 4: #8BC34A (Light green) → Afternoon snack
Meal 5: #4CAF50 (Green)       → Dinner health
Meal 6: #009688 (Teal)        → Evening snack
```

**Reasoning**:
- Rainbow progression (warm to cool)
- High contrast between adjacent meals
- Color psychology (red = energy, green = health)

### Macro Colors

```
Calories: #4CAF50 (Green)     → Primary metric
Protein:  #2196F3 (Blue)      → Building/recovery
Carbs:    #FF9800 (Orange)    → Energy
Fat:      #757575 (Gray)      → Essential but not primary
```

### UI Colors

```
Primary:   #4CAF50  → Actions, success
Secondary: #2196F3  → Info, links
Accent:    #FF9800  → Highlights
Error:     #F44336  → Warnings, delete
```

## Typography

### Size Scale
```
Header:  28pt (bold)  → App title
Title:   22pt (bold)  → Section headers
Large:   20pt (bold)  → Macro values
Body:    16pt         → Normal text
Small:   14pt         → Secondary info
Tiny:    12pt         → Labels, hints
```

**Reasoning**: Large text for quick scanning while moving

### Hierarchy
1. **Macro numbers** - Largest, colored
2. **Meal numbers** - Large, bold
3. **Section titles** - Bold
4. **Body text** - Regular
5. **Labels** - Small, gray

## Touch Targets

All interactive elements meet minimum size requirements:

- **Buttons**: 44x44pt minimum (Apple HIG)
- **Meal number selectors**: 70x70pt (extra large)
- **FAB**: 64x64pt (prominent)
- **List items**: Full-width, 60pt+ height

**Reasoning**: Easier to tap while in motion or with gloves

## Spacing & Layout

### Grid System
- **Padding**: 16-20pt standard
- **Margins**: 8-12pt between elements
- **Card radius**: 12pt (friendly, modern)

### White Space
- Generous spacing between meal cards
- Breathing room around numbers
- Clear visual separation of sections

**Reasoning**: Reduces cognitive load, improves scannability

## Motion & Feedback

### Animations
- **Screen transitions**: Slide from right (standard)
- **Camera**: Slide from bottom (modal)
- **Loading**: Subtle spinner with text
- **Success**: Brief confirmation, auto-dismiss

### Haptics (Future)
- Meal logged: Success vibration
- Error: Warning vibration
- Milestone reached: Celebration

### Loading States
- **Camera analysis**: Overlay with spinner
- **Export**: Modal with progress
- **List loading**: Spinner centered

**Reasoning**: Clear feedback without being distracting

## Accessibility Considerations

### Current
- High contrast ratios (WCAG AA)
- Large touch targets
- Clear visual hierarchy
- Simple navigation

### Future Enhancements
- VoiceOver support
- Dynamic type sizing
- Reduced motion option
- Color blind friendly mode

## Error Handling

### Philosophy: Fail Gracefully

**No API key?** → Use estimates
**Camera fails?** → Offer gallery
**No internet?** → Work offline
**Bad photo?** → Manual adjustment

### User-Facing Errors
- Simple language ("Could not save meal")
- Clear action ("Try again")
- Fallback options (manual entry)

## Data Visualization

### Daily Summary Card

**Design Choice**: Circular macro displays

**Reasoning**:
- Circles are friendlier than bars/charts
- Easy to compare sizes visually
- Filled circles show progress
- Center number is key info

### Meal Cards

**Design Choice**: Photo + compact macro row

**Reasoning**:
- Photo jogs memory
- Numbers in consistent order
- Quick scan of day's meals
- Tap for more details

## Mobile-First Patterns

### Standard Conventions Used
- Pull to refresh (iOS/Android standard)
- FAB for primary action (Material Design)
- Swipe gestures (native feel)
- Native navigation (back button, gestures)

### Custom Patterns
- Meal number selector (domain-specific)
- Color-coded meals (unique to app)
- +/- macro adjusters (simplified input)

## Performance Considerations

### Image Handling
- Compress photos to 80% quality
- Store locally (no server needed)
- Lazy load in history
- Clear old photos option

### Data Loading
- AsyncStorage (instant access)
- Optimistic UI updates
- Background sync (future)

## Testing with Target Users

### Key Findings (Hypothetical)
1. **Confusion**: Time-based meal names ("breakfast" vs "lunch")
   **Fix**: Simple numbers 1-6

2. **Friction**: Manual macro entry
   **Fix**: Auto-analysis with photo

3. **Abandonment**: Too many steps
   **Fix**: Reduced to 3 screens

4. **Sharing**: Parents want to see data
   **Fix**: CSV export for Google Sheets

## Design Evolution

### Version 1.0 (Current)
- Core meal logging
- Photo capture
- Basic export

### Version 2.0 (Planned)
- Meal templates
- Water tracking
- Dark mode

### Version 3.0 (Future)
- Barcode scanning
- Custom goals
- Charts/trends

## Comparison to Competitors

### MyFitnessPal
- **MFP**: Comprehensive, complex
- **MealTrack**: Simple, focused
- **Difference**: We optimize for speed over features

### Lose It!
- **Lose It**: Weight loss focused
- **MealTrack**: Athletic performance focused
- **Difference**: We target structured meal plans

### Cronometer
- **Cronometer**: Detailed micronutrients
- **MealTrack**: Quick macros only
- **Difference**: We prioritize ease over precision

## Design System

### Component Library
- `MealCard` - Consistent meal display
- `DailySummaryCard` - Standard summary format
- `MealNumberSelector` - Unique meal picker
- `MacroAdjuster` - Uniform adjustment controls

### Reusability
All components accept props for customization while maintaining visual consistency.

## Future Design Considerations

### Dark Mode
- OLED-friendly blacks
- Reduce blue light for evening use
- Maintain color-coding system

### Tablet Support
- Two-column layout
- Side-by-side meal cards
- Expanded summary view

### Wearable Integration
- Quick log from watch
- Water intake tracking
- Meal reminders

---

**Design Philosophy Summary**:
Make tracking nutrition as effortless as taking a photo. Remove all barriers between the athlete and their data. Trust that simplicity wins over complexity when the user is in motion.
