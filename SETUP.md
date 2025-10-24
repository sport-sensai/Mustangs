# Setup Guide for MealTrack

This guide will help you get the MealTrack app running on your device in under 10 minutes.

## Quick Start (No API Setup)

The fastest way to test the app:

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Use LTS version (18.x or higher)
   - Verify: `node --version`

2. **Install Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **Install Dependencies**
   ```bash
   cd Mustangs
   npm install
   ```

4. **Start the App**
   ```bash
   npm start
   ```

5. **Run on Your Device**
   - Install "Expo Go" app from App Store/Play Store
   - Scan the QR code shown in terminal
   - App will load on your phone!

**That's it!** The app works immediately with estimated macros. Continue below for better accuracy.

## Full Setup (With Food Recognition)

For more accurate macro calculations, set up a food recognition API:

### Option 1: CalorieNinjas (Easiest)

**Best for**: Quick setup, simple API, good accuracy

1. **Sign up for CalorieNinjas**
   - Go to: https://calorieninjas.com/api
   - Click "Get API Key"
   - Enter your email
   - Free tier: 100 requests/month

2. **Get your API key**
   - Check your email for API key
   - Copy the key (looks like: `abcd1234efgh5678ijkl9012mnop3456`)

3. **Add to your project**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:
   ```
   CALORIE_NINJAS_API_KEY=your_actual_key_here
   ```

4. **Restart the app**
   ```bash
   npm start
   ```

### Option 2: Edamam (More Requests)

**Best for**: Higher usage, more detailed data

1. **Sign up for Edamam**
   - Go to: https://developer.edamam.com/
   - Click "Sign Up"
   - Choose "Food Database API"
   - Free tier: 10,000 requests/month

2. **Get your credentials**
   - After signup, go to Dashboard
   - Find "Application ID" and "Application Keys"
   - Copy both values

3. **Add to your project**
   Edit `.env`:
   ```
   EDAMAM_APP_ID=your_app_id
   EDAMAM_APP_KEY=your_app_key
   ```

4. **Restart the app**

## Platform-Specific Setup

### iOS (Mac Required)

#### Simulator
```bash
npm start
# Press 'i' to open iOS simulator
```

#### Physical Device
1. Install Expo Go from App Store
2. Scan QR code from terminal
3. Grant camera permissions when prompted

### Android

#### Emulator
1. Install Android Studio
2. Set up Android emulator
3. Start emulator
4. Run: `npm start`, press 'a'

#### Physical Device
1. Install Expo Go from Play Store
2. Scan QR code from terminal
3. Grant camera and storage permissions

## Troubleshooting Setup

### "npm install" fails

**Solution 1**: Clear cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2**: Use yarn instead
```bash
npm install -g yarn
yarn install
yarn start
```

### "Expo Go won't connect"

1. **Ensure same WiFi**
   - Phone and computer must be on same network
   - Disable VPN if active

2. **Try tunnel mode**
   ```bash
   expo start --tunnel
   ```

3. **Use physical connection**
   - iOS: Use Safari to open link
   - Android: Use direct IP address

### Camera permissions not working

**iOS**:
1. Settings > Privacy > Camera
2. Find "Expo Go"
3. Enable camera access

**Android**:
1. Settings > Apps > Expo Go
2. Permissions > Camera
3. Allow camera access

### App crashes on photo capture

1. **Check storage space** - needs room for photos
2. **Restart Expo Go app**
3. **Reinstall Expo Go**
4. **Clear app data**: Settings > Apps > Expo Go > Clear Data

### Environment variables not loading

1. **Restart Metro bundler**
   - Press Ctrl+C to stop
   - Run `npm start` again

2. **Check .env format**
   - No spaces around `=`
   - No quotes around values
   - File named exactly `.env`

3. **Install dotenv** (if needed)
   ```bash
   npm install react-native-dotenv
   ```

## Development Tips

### Hot Reload
- Shake device to open developer menu
- Enable "Fast Refresh"
- Changes appear automatically

### Debugging
```bash
# Open developer menu
# iOS: Cmd+D (simulator) or shake device
# Android: Cmd+M (emulator) or shake device

# Remote debugging in Chrome
# Select "Debug Remote JS"
```

### Clear Data (Testing)
```bash
# Reset app storage
# Developer Menu > "Clear AsyncStorage"
```

### Production Build

**iOS**:
```bash
expo build:ios
```

**Android**:
```bash
expo build:android
```

Follow prompts to create signed builds for App Store/Play Store submission.

## Next Steps

After setup:
1. ✅ Test camera functionality
2. ✅ Log a test meal
3. ✅ Review daily summary
4. ✅ Try export feature
5. ✅ Check history view

## Getting Help

**Common issues**: Check TROUBLESHOOTING section in README.md

**Expo issues**: https://docs.expo.dev/

**React Native issues**: https://reactnative.dev/docs/troubleshooting

**Food API issues**:
- CalorieNinjas: https://calorieninjas.com/api/docs
- Edamam: https://developer.edamam.com/edamam-docs-nutrition-api

## Performance Tips

### For Best Results:
1. **Photo quality**:
   - Good lighting
   - Clear view of food
   - Fill frame with meal
   - Avoid shadows

2. **API usage**:
   - Free tiers have limits
   - App caches results
   - Manual adjust if needed

3. **Storage**:
   - Photos stored locally
   - ~5MB per 100 meals
   - Clear old data via History

Ready to track your nutrition! 🏋️‍♂️📸
