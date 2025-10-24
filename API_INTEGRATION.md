# API Integration Guide

This guide explains how to integrate food recognition APIs with MealTrack for automatic macro calculation.

## Overview

MealTrack supports two food recognition APIs:

1. **CalorieNinjas** - Simple, quick setup (recommended)
2. **Edamam** - More detailed data, higher limits

The app works without any API (using estimates), but accuracy improves significantly with API integration.

## Architecture

```
Photo Capture → Food Recognition → Macro Calculation → Display to User
                      ↓
              [Optional API Call]
                      ↓
                [Fallback to Estimates]
```

**Key Feature**: Graceful degradation - if API fails, app still works.

## CalorieNinjas Integration

### Setup

1. **Sign up**: https://calorieninjas.com/api
2. **Get API key**: Check email after signup
3. **Add to .env**:
   ```
   CALORIE_NINJAS_API_KEY=your_key_here
   ```

### API Details

**Endpoint**: `GET https://api.calorieninjas.com/v1/nutrition`

**Headers**:
```
X-Api-Key: YOUR_API_KEY
```

**Query Parameters**:
```
query: "food description" (e.g., "chicken breast and rice")
```

**Example Request**:
```bash
curl -X GET "https://api.calorieninjas.com/v1/nutrition?query=chicken%20breast%20and%20rice" \
  -H "X-Api-Key: YOUR_KEY"
```

**Example Response**:
```json
{
  "items": [
    {
      "name": "chicken breast",
      "calories": 165,
      "protein_g": 31,
      "carbohydrates_total_g": 0,
      "fat_total_g": 3.6
    },
    {
      "name": "rice",
      "calories": 130,
      "protein_g": 2.7,
      "carbohydrates_total_g": 28,
      "fat_total_g": 0.3
    }
  ]
}
```

### Implementation

See `src/services/foodRecognition.ts`:

```typescript
async function getNutritionData(foodQuery: string): Promise<Macros> {
  const API_KEY = process.env.CALORIE_NINJAS_API_KEY;

  const response = await axios.get(
    `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(foodQuery)}`,
    {
      headers: { 'X-Api-Key': API_KEY },
      timeout: 10000,
    }
  );

  const items = response.data.items || [];

  // Sum all items
  return items.reduce((acc, item) => ({
    calories: acc.calories + (item.calories || 0),
    protein: acc.protein + (item.protein_g || 0),
    carbs: acc.carbs + (item.carbohydrates_total_g || 0),
    fat: acc.fat + (item.fat_total_g || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
```

### Limitations

- **Free tier**: 100 requests/month
- **Rate limit**: Reasonable for personal use
- **Coverage**: US foods primarily
- **Accuracy**: Good for common foods

## Edamam Integration

### Setup

1. **Sign up**: https://developer.edamam.com/
2. **Create app**: Choose "Food Database API"
3. **Get credentials**: App ID + App Key
4. **Add to .env**:
   ```
   EDAMAM_APP_ID=your_app_id
   EDAMAM_APP_KEY=your_app_key
   ```

### API Details

**Endpoint**: `GET https://api.edamam.com/api/food-database/v2/parser`

**Query Parameters**:
```
app_id: YOUR_APP_ID
app_key: YOUR_APP_KEY
ingr: "food description"
```

**Example Request**:
```bash
curl -X GET "https://api.edamam.com/api/food-database/v2/parser?app_id=YOUR_ID&app_key=YOUR_KEY&ingr=chicken%20breast"
```

**Example Response**:
```json
{
  "parsed": [
    {
      "food": {
        "foodId": "food_a9xs7abb632hn3abbh5j",
        "label": "Chicken Breast",
        "nutrients": {
          "ENERC_KCAL": 165,
          "PROCNT": 31,
          "CHOCDF": 0,
          "FAT": 3.6
        }
      }
    }
  ]
}
```

### Implementation

```typescript
async function getEdamamNutrition(foodQuery: string): Promise<Macros> {
  const APP_ID = process.env.EDAMAM_APP_ID;
  const APP_KEY = process.env.EDAMAM_APP_KEY;

  const response = await axios.get(
    `https://api.edamam.com/api/food-database/v2/parser`,
    {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        ingr: foodQuery,
      },
      timeout: 10000,
    }
  );

  const food = response.data.parsed[0]?.food;
  const nutrients = food?.nutrients || {};

  return {
    calories: Math.round(nutrients.ENERC_KCAL || 0),
    protein: Math.round((nutrients.PROCNT || 0) * 10) / 10,
    carbs: Math.round((nutrients.CHOCDF || 0) * 10) / 10,
    fat: Math.round((nutrients.FAT || 0) * 10) / 10,
  };
}
```

### Limitations

- **Free tier**: 10,000 requests/month
- **Rate limit**: 10 requests/minute
- **Coverage**: Global foods
- **Accuracy**: Very detailed

## Image Recognition (Future Enhancement)

Currently, the app uses text-based food queries. Future versions will use image recognition.

### Google Cloud Vision API

**Use case**: Identify food items from photos

**Endpoint**: `POST https://vision.googleapis.com/v1/images:annotate`

**Request**:
```json
{
  "requests": [
    {
      "image": {
        "content": "BASE64_ENCODED_IMAGE"
      },
      "features": [
        {
          "type": "LABEL_DETECTION",
          "maxResults": 10
        }
      ]
    }
  ]
}
```

**Response**:
```json
{
  "responses": [
    {
      "labelAnnotations": [
        {
          "description": "Chicken",
          "score": 0.98
        },
        {
          "description": "Rice",
          "score": 0.95
        }
      ]
    }
  ]
}
```

**Integration Plan**:
1. Send photo to Vision API
2. Get detected food labels
3. Query nutrition API with detected foods
4. Sum macros from all detected items

### Implementation Roadmap

```typescript
// Future implementation
async function analyzeImageWithVision(imageUri: string): Promise<string[]> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await axios.post(
    'https://vision.googleapis.com/v1/images:annotate',
    {
      requests: [
        {
          image: { content: base64 },
          features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
        },
      ],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      params: { key: process.env.GOOGLE_VISION_API_KEY },
    }
  );

  return response.data.responses[0].labelAnnotations.map(
    (label: any) => label.description
  );
}
```

## Error Handling

### Network Errors

```typescript
try {
  const macros = await getNutritionData(foodQuery);
  return macros;
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    // Timeout - use fallback
    return estimateMacrosFromImage();
  }
  if (error.response?.status === 429) {
    // Rate limit - use fallback
    return estimateMacrosFromImage();
  }
  throw error;
}
```

### API Limits

```typescript
// Track API usage (future)
const API_USAGE_KEY = '@api_usage';

async function trackAPIUsage() {
  const usage = await AsyncStorage.getItem(API_USAGE_KEY);
  const data = usage ? JSON.parse(usage) : { count: 0, month: new Date().getMonth() };

  // Reset monthly
  if (data.month !== new Date().getMonth()) {
    data.count = 0;
    data.month = new Date().getMonth();
  }

  data.count++;
  await AsyncStorage.setItem(API_USAGE_KEY, JSON.stringify(data));

  // Warn if approaching limit
  if (data.count >= 90) {
    Alert.alert('API Limit', 'Approaching monthly limit. Some features may use estimates.');
  }
}
```

## Fallback Strategy

The app uses a tiered approach:

```
1. Try API call (if configured)
   ↓ (on failure)
2. Use cached/similar meals (future)
   ↓ (if none found)
3. Use estimated averages
   ↓
4. Allow manual adjustment
```

### Estimation Logic

```typescript
function estimateMacrosFromImage(): Macros {
  // Average balanced meal for teenage athlete
  return {
    calories: 500,   // Moderate meal
    protein: 30,     // ~25% of calories
    carbs: 60,       // ~48% of calories
    fat: 15,         // ~27% of calories
  };
}
```

**Why these defaults?**
- 500 calories = typical meal for 2000-3000 daily intake
- Protein: Important for athletes (1.2-1.7g/kg body weight)
- Carbs: Primary energy source
- Fat: Essential nutrients

## Testing API Integration

### Test Without API

```bash
# Don't configure .env
npm start
# App should work with estimates
```

### Test With CalorieNinjas

```bash
# Add API key to .env
CALORIE_NINJAS_API_KEY=test_key

# Take photo of known food
# Verify macros are accurate
# Check console for API logs
```

### Test Error Handling

```bash
# Use invalid API key
CALORIE_NINJAS_API_KEY=invalid_key

# App should fall back to estimates
# User should see macros (estimated)
```

## Performance Optimization

### Caching

```typescript
// Cache common foods (future)
const FOOD_CACHE_KEY = '@food_cache';

interface CachedFood {
  query: string;
  macros: Macros;
  timestamp: number;
}

async function getCachedMacros(foodQuery: string): Promise<Macros | null> {
  const cache = await AsyncStorage.getItem(FOOD_CACHE_KEY);
  if (!cache) return null;

  const foods: CachedFood[] = JSON.parse(cache);
  const match = foods.find(f =>
    f.query.toLowerCase() === foodQuery.toLowerCase() &&
    Date.now() - f.timestamp < 7 * 24 * 60 * 60 * 1000 // 7 days
  );

  return match?.macros || null;
}
```

### Request Debouncing

```typescript
// Prevent rapid API calls
let lastRequest = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds

async function debouncedNutritionRequest(query: string) {
  const now = Date.now();
  if (now - lastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastRequest))
    );
  }
  lastRequest = Date.now();
  return getNutritionData(query);
}
```

## Cost Analysis

### CalorieNinjas
- **Free tier**: 100 requests/month = $0
- **Paid tiers**: Not needed for personal use
- **Cost per user**: $0/month for casual use

### Edamam
- **Free tier**: 10,000 requests/month = $0
- **Developer tier**: 100,000 requests = $9.99/month
- **Cost per user**: $0 for teams/schools

### Google Vision (Future)
- **Free tier**: 1,000 requests/month = $0
- **Paid tier**: $1.50 per 1,000 requests
- **Cost per user**: ~$0.15/month (100 meals)

## Best Practices

1. **Always have fallback** - Never block user on API failure
2. **Cache results** - Reduce API calls for common foods
3. **Monitor usage** - Track monthly limits
4. **Timeout requests** - Don't wait forever (10s max)
5. **User feedback** - Show when using estimates vs API

## Security

### API Key Protection

**DON'T**:
```typescript
const API_KEY = 'hardcoded_key_here'; // ❌ Never do this
```

**DO**:
```typescript
const API_KEY = process.env.CALORIE_NINJAS_API_KEY; // ✅ Use environment variables
```

### .env File

**Include in .gitignore**:
```
.env
.env.local
.env.production
```

**Never commit**:
- API keys
- Secrets
- Credentials

## Future Enhancements

1. **Machine Learning**: Train custom model on athlete meals
2. **Portion Detection**: Estimate serving size from photo
3. **Barcode Scanning**: Use UPC codes for packaged foods
4. **Voice Input**: "Log chicken and rice" → Siri/Assistant
5. **Multi-food Detection**: Identify all items on plate

---

**Remember**: The goal is accuracy without friction. APIs help, but the app must work without them.
