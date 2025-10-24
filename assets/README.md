# Assets Directory

This directory contains all visual assets for the MealTrack app.

## Required Assets

### App Icons

#### icon.png
- **Size**: 1024x1024px
- **Format**: PNG with transparency
- **Usage**: App icon on home screen
- **Design**: Simple, recognizable at small sizes
- **Suggestion**: Camera + food symbol, green background

#### adaptive-icon.png
- **Size**: 1024x1024px
- **Format**: PNG with transparency
- **Usage**: Android adaptive icon (foreground)
- **Design**: Icon without background
- **Safe area**: Center 768x768px (avoid edges)

#### splash.png
- **Size**: 1242x2436px (iPhone X/11/12/13 Pro Max)
- **Format**: PNG
- **Usage**: Launch screen while app loads
- **Design**: App name + icon, green background (#4CAF50)

### Asset Specifications

```
assets/
├── icon.png           (1024x1024, App icon)
├── adaptive-icon.png  (1024x1024, Android foreground)
└── splash.png         (1242x2436, Splash screen)
```

## Creating Assets

### Option 1: Design Tool (Recommended)

Use Figma, Sketch, or Adobe XD:

1. **Create icon.png**:
   - 1024x1024px canvas
   - Green background (#4CAF50)
   - Simple camera + plate icon
   - Export as PNG

2. **Create adaptive-icon.png**:
   - Same design as icon.png
   - Remove background
   - Keep design in center 768x768px

3. **Create splash.png**:
   - 1242x2436px canvas
   - Green background (#4CAF50)
   - Center app name "MealTrack"
   - Add icon above name
   - Export as PNG

### Option 2: Icon Generator

Use online tools:
- https://www.appicon.co/ - Generate all sizes
- https://easyappicon.com/ - App icon generator
- https://apetools.webprofusion.com/ - Icon resizer

### Option 3: Template

Basic SVG template for icon:

```svg
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#4CAF50" rx="180"/>

  <!-- Camera body -->
  <rect x="312" y="412" width="400" height="300" fill="white" rx="40"/>

  <!-- Camera lens -->
  <circle cx="512" cy="562" r="100" fill="#4CAF50"/>
  <circle cx="512" cy="562" r="60" fill="white"/>

  <!-- Plate accent -->
  <ellipse cx="512" cy="700" rx="150" ry="20" fill="white" opacity="0.3"/>
</svg>
```

## Placeholder Assets

For development, you can use solid color placeholders:

### Quick Placeholder Generation

Using ImageMagick (command line):

```bash
# icon.png - 1024x1024 green square with white text
convert -size 1024x1024 xc:#4CAF50 \
  -font Arial -pointsize 100 -fill white \
  -gravity center -annotate +0+0 'MT' \
  assets/icon.png

# adaptive-icon.png - same but transparent background
convert -size 1024x1024 xc:transparent \
  -font Arial -pointsize 200 -fill #4CAF50 \
  -gravity center -annotate +0+0 'MT' \
  assets/adaptive-icon.png

# splash.png - 1242x2436 green with title
convert -size 1242x2436 xc:#4CAF50 \
  -font Arial -pointsize 120 -fill white \
  -gravity center -annotate +0-200 'MealTrack' \
  -pointsize 80 -annotate +0+100 'Athlete Nutrition Tracker' \
  assets/splash.png
```

### Using Node.js

Create script `scripts/generate-assets.js`:

```javascript
const { createCanvas } = require('canvas');
const fs = require('fs');

function generateIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 200px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MT', size / 2, size / 2);

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./assets/icon.png', buffer);
}

generateIcon();
```

## Design Guidelines

### App Icon
- **Keep it simple**: Recognizable at 60x60px
- **Avoid text**: Hard to read at small sizes
- **Use contrast**: Stand out on various backgrounds
- **Consistent color**: Use brand green (#4CAF50)
- **Unique shape**: Distinguish from other apps

### Splash Screen
- **Fast loading**: Optimize file size
- **Minimal content**: Just branding
- **Match UI**: Use app colors
- **Center important elements**: Safe for all devices

## Testing Assets

After adding assets:

1. **Clear Expo cache**:
   ```bash
   expo start -c
   ```

2. **View on device**:
   - Check icon on home screen
   - Observe splash screen on launch
   - Test on both iOS and Android

3. **Verify sizes**:
   - Icon should be crisp, not blurry
   - Splash should fill screen
   - No stretching or distortion

## Production Assets

Before app store submission:

### iOS Requirements
- App icon: 1024x1024px (no transparency)
- No alpha channel
- Square corners (iOS adds them)

### Android Requirements
- Adaptive icon foreground: 1024x1024px
- Adaptive icon background: Solid color or 1024x1024px
- Support for different densities

### Asset Checklist
- [ ] icon.png (1024x1024)
- [ ] adaptive-icon.png (1024x1024)
- [ ] splash.png (1242x2436)
- [ ] All files optimized (TinyPNG, ImageOptim)
- [ ] No copyright issues
- [ ] Tested on real devices

## Resources

- **Icon design**: https://developer.apple.com/design/human-interface-guidelines/app-icons
- **Android adaptive**: https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive
- **Color contrast**: https://webaim.org/resources/contrastchecker/
- **Free icons**: https://www.flaticon.com/

## Current Status

⚠️ **Placeholder assets needed**

To generate basic placeholders quickly:
```bash
# Create solid color placeholders
touch assets/icon.png
touch assets/adaptive-icon.png
touch assets/splash.png
```

The app will use default Expo assets until custom ones are added.
