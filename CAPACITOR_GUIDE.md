# Capacitor Android App Guide

## Overview
Your web app has been successfully converted to a native Android app using Capacitor! 🎉

## What Was Done

### 1. **Installed Capacitor**
- Added `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android` packages
- Initialized Capacitor with:
  - App Name: **SecureDoc Manager**
  - App ID: **com.securedoc.manager**

### 2. **Android Platform Added**
- Created Android project in the `android/` folder
- Configured to use the `build/` directory as web assets

### 3. **Permissions Configured**
The following permissions have been added to `AndroidManifest.xml`:
- ✅ Internet access
- ✅ Network state
- ✅ Camera
- ✅ File read/write (for document uploads)
- ✅ Media access (images, video, audio)

### 4. **NPM Scripts Added**
New commands available in `package.json`:
- `npm run android` - Opens Android project in Android Studio
- `npm run android:sync` - Builds web app and syncs to Android
- `npm run android:run` - Builds, syncs, and runs on connected device/emulator
- `npm run cap:sync` - Syncs all platforms
- `npm run cap:update` - Updates Capacitor platforms

## How to Run and Build

### Prerequisites
- ✅ Android Studio installed (you mentioned you have this)
- ✅ Android SDK configured
- ✅ USB debugging enabled on your Android device (optional, for testing on device)

### Development Workflow

#### Option 1: Using Android Studio (Recommended)
```bash
# 1. Build the web app and sync to Android
npm run android:sync

# 2. Open in Android Studio
npm run android
```

Then in Android Studio:
- Click the **Run** button (green play icon)
- Select your device or emulator
- Wait for the app to build and install

#### Option 2: Using Command Line
```bash
# Run directly on connected device/emulator
npm run android:run
```

#### Option 3: Manual Steps
```bash
# 1. Build the React app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

### Making Changes

When you make changes to your React app:

```bash
# 1. Make your code changes in src/

# 2. Sync to Android (builds + syncs)
npm run android:sync

# 3. Run in Android Studio or via CLI
npm run android
```

## Building APK/AAB for Release

### Debug APK (for testing)
1. Open Android Studio
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Wait for build to complete
4. Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)
1. Open Android Studio
2. Go to **Build > Generate Signed Bundle / APK**
3. Choose **APK**
4. Create/use a keystore for signing
5. Select **release** build variant
6. Find APK at: `android/app/build/outputs/apk/release/app-release.apk`

### Release AAB (for Google Play)
1. Open Android Studio
2. Go to **Build > Generate Signed Bundle / APK**
3. Choose **Android App Bundle**
4. Use your keystore for signing
5. Find AAB at: `android/app/build/outputs/bundle/release/app-release.aab`

## Capacitor Configuration

The app is configured in `capacitor.config.ts`:
```typescript
{
  appId: 'com.securedoc.manager',
  appName: 'SecureDoc Manager',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true  // Allows local development
  },
  android: {
    allowMixedContent: true
  }
}
```

## Recommended Capacitor Plugins

You may want to add these plugins for enhanced native functionality:

### Camera Plugin
```bash
npm install @capacitor/camera
npx cap sync
```

### Filesystem Plugin
```bash
npm install @capacitor/filesystem
npx cap sync
```

### Share Plugin
```bash
npm install @capacitor/share
npx cap sync
```

### App Plugin (for app info)
```bash
npm install @capacitor/app
npx cap sync
```

### Status Bar Plugin
```bash
npm install @capacitor/status-bar
npx cap sync
```

### Splash Screen Plugin
```bash
npm install @capacitor/splash-screen
npx cap sync
```

## Customizing the App

### Change App Name
Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Change App Icon
Replace icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

Or use a tool like [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

### Change Package Name/App ID
1. Edit `capacitor.config.ts` → change `appId`
2. Run `npx cap sync android`
3. Update in Android Studio if needed

### Add Splash Screen
1. Add splash screen image to `android/app/src/main/res/drawable/splash.png`
2. Configure in `capacitor.config.ts`

## Troubleshooting

### Build Fails
- Ensure Android SDK is properly installed
- Check Java JDK version (JDK 11 or higher recommended)
- Clean build: In Android Studio → **Build > Clean Project**

### App Not Updating
```bash
# Force rebuild and sync
npm run build
npx cap sync android
```

### Environment Variables Not Working
Capacitor apps are **static builds**. Environment variables are baked in at build time:
1. Update `.env.local`
2. Run `npm run build`
3. Run `npx cap sync android`

### Device Not Detected
- Enable USB debugging on Android device
- Install device drivers
- Check connection with: `adb devices`

### Gradle Issues
```bash
# In android/ folder
cd android
./gradlew clean
cd ..
npm run android:sync
```

## Useful Commands

```bash
# Check Capacitor doctor (diagnostics)
npx cap doctor

# List available platforms
npx cap ls

# Update Capacitor
npm install @capacitor/cli@latest @capacitor/core@latest @capacitor/android@latest
npx cap sync

# View Android logs
npx cap run android -l
```

## Testing on Device

1. **Enable Developer Options** on Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   
2. **Enable USB Debugging**:
   - Settings > Developer Options > USB Debugging

3. **Connect device via USB**

4. **Run the app**:
   ```bash
   npm run android:run
   ```

## Next Steps

1. ✅ Test the app in Android Studio
2. Add native features using Capacitor plugins
3. Customize app icon and splash screen
4. Configure release signing
5. Build release APK/AAB for distribution

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio/run)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Android Studio Download](https://developer.android.com/studio)

---

**Your app is ready to run in Android Studio!** 🚀

Run `npm run android` to get started.
