# 🚀 Android App - Quick Start

Your **SecureDoc Manager** web app is now a native Android app!

## ⚡ Run in Android Studio (3 Simple Steps)

### Step 1: Sync the App
```bash
npm run android:sync
```
*This builds your React app and copies it to the Android project*

### Step 2: Open Android Studio
```bash
npm run android
```
*This opens the Android project in Android Studio*

### Step 3: Run the App
- In Android Studio, click the **green play button** ▶️
- Select your device or emulator
- Wait for the app to install and launch

---

## 📱 What's Included

✅ **Full Android app** in the `android/` folder  
✅ **All necessary permissions** (Camera, Files, Internet, etc.)  
✅ **6 Native plugins** installed:
- Camera
- Filesystem  
- Share
- App Info
- Status Bar
- Splash Screen

✅ **NPM scripts** for easy development  
✅ **Configured for release builds**

---

## 🔄 When You Make Code Changes

```bash
# After editing your React code:
npm run android:sync

# Then press "Run" in Android Studio again
```

---

## 📦 Build APK for Testing

1. Open Android Studio
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🎯 Build for Google Play Store

1. Open Android Studio
2. **Build → Generate Signed Bundle / APK**
3. Choose **Android App Bundle (AAB)**
4. Create/use keystore for signing
5. Upload AAB to Google Play Console

---

## 📚 Full Documentation

See **CAPACITOR_GUIDE.md** for complete documentation including:
- Detailed build instructions
- Customization options
- Troubleshooting
- Plugin usage examples

---

## 🎉 You're Ready!

Run this command now:
```bash
npm run android
```

Your Android Studio should open with the project ready to run! 🚀
