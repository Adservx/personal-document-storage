# ✅ Android App Setup Checklist

## Pre-flight Check

Use this checklist to ensure everything is ready before running your Android app.

---

## 📦 Installation Verification

### ✅ Capacitor Packages Installed
- [ ] `@capacitor/core` installed
- [ ] `@capacitor/cli` installed
- [ ] `@capacitor/android` installed

**Verify:** Check `package.json` dependencies

### ✅ Capacitor Plugins Installed
- [ ] `@capacitor/camera`
- [ ] `@capacitor/filesystem`
- [ ] `@capacitor/share`
- [ ] `@capacitor/app`
- [ ] `@capacitor/status-bar`
- [ ] `@capacitor/splash-screen`

**Verify:** Check `package.json` dependencies

---

## 📁 Files & Folders Check

### ✅ Configuration Files Created
- [ ] `capacitor.config.ts` exists in root
- [ ] `android/` folder exists
- [ ] `android/app/src/main/AndroidManifest.xml` exists
- [ ] `.gitignore` updated with Capacitor entries

### ✅ Documentation Files Created
- [ ] `CAPACITOR_GUIDE.md` exists
- [ ] `ANDROID_QUICKSTART.md` exists
- [ ] `CONVERSION_SUMMARY.md` exists
- [ ] `ANDROID_CHECKLIST.md` (this file) exists

---

## ⚙️ Configuration Check

### ✅ Capacitor Config
- [ ] `appId` is set to `com.securedoc.manager`
- [ ] `appName` is set to `SecureDoc Manager`
- [ ] `webDir` is set to `build`

**Verify:** Open `capacitor.config.ts`

### ✅ Android Permissions
- [ ] Internet permission added
- [ ] Camera permission added
- [ ] File access permissions added
- [ ] Network state permission added

**Verify:** Open `android/app/src/main/AndroidManifest.xml`

---

## 🛠️ Development Tools Check

### ✅ Android Studio
- [ ] Android Studio is installed
- [ ] Android SDK is configured
- [ ] SDK version 22+ is installed
- [ ] Build tools are installed

**Verify:** Open Android Studio → Settings → Android SDK

### ✅ Environment Setup
- [ ] Java JDK 11+ is installed
- [ ] ANDROID_HOME environment variable is set
- [ ] `adb` command works in terminal

**Test:** Run `adb version` in terminal

---

## 🔧 NPM Scripts Check

### ✅ New Scripts Added to package.json
- [ ] `android` script exists
- [ ] `android:sync` script exists
- [ ] `android:run` script exists
- [ ] `cap:sync` script exists
- [ ] `cap:update` script exists

**Verify:** Check `package.json` scripts section

---

## 🏗️ Build Verification

### ✅ Web App Build
- [ ] `npm run build` completes successfully
- [ ] `build/` folder is created
- [ ] No build errors in console

**Test:**
```bash
npm run build
```

### ✅ Capacitor Sync
- [ ] `npx cap sync android` completes successfully
- [ ] Web assets copied to Android
- [ ] Plugins registered correctly
- [ ] No sync errors

**Test:**
```bash
npx cap sync android
```

---

## 📱 Android Project Check

### ✅ Android Project Structure
- [ ] `android/app/src/main/` folder exists
- [ ] `android/app/build.gradle` exists
- [ ] `android/gradle/` folder exists
- [ ] `android/settings.gradle` exists

### ✅ Android Assets
- [ ] Web assets copied to `android/app/src/main/assets/public/`
- [ ] `capacitor.config.json` exists in assets
- [ ] App icons present in `android/app/src/main/res/mipmap-*/`

---

## 🚀 Ready to Run?

### Final Pre-flight Checks
- [ ] All above items checked ✅
- [ ] Android Studio is open
- [ ] Device/emulator is connected (optional)
- [ ] Environment variables configured (if needed)

### First Run Command
```bash
npm run android
```

This should:
1. ✅ Open Android Studio
2. ✅ Load the project
3. ✅ Show no errors

### Run the App
In Android Studio:
1. [ ] Click the green ▶️ Run button
2. [ ] Select device/emulator
3. [ ] Wait for build to complete
4. [ ] App launches successfully

---

## 🐛 Troubleshooting Quick Reference

### If Build Fails
```bash
cd android
./gradlew clean
cd ..
npm run android:sync
```

### If Assets Not Updating
```bash
npm run build
npx cap sync android --force
```

### If Android Studio Won't Open
```bash
# Try direct path (Windows)
npx cap open android

# Or manually:
# Open Android Studio → Open Project → Select android/ folder
```

### If Gradle Errors
1. Open Android Studio
2. File → Invalidate Caches / Restart
3. Rebuild project

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run android              # Open Android Studio
npm run android:sync         # Build + sync to Android
npm run android:run          # Build + sync + run on device

# Diagnostics
npx cap doctor              # Check Capacitor setup
adb devices                 # List connected devices
npx cap ls                  # List platforms

# Maintenance
npx cap sync                # Sync all platforms
npx cap update              # Update Capacitor
npm run build               # Build React app
```

---

## ✅ All Done?

If all checkboxes above are checked, you're ready to run:

```bash
npm run android
```

Then click ▶️ in Android Studio and watch your app come to life! 🎉

---

## 📚 Need Help?

Stuck on any step? Check these files:
- **Quick guide**: `ANDROID_QUICKSTART.md`
- **Full documentation**: `CAPACITOR_GUIDE.md`
- **What was done**: `CONVERSION_SUMMARY.md`

Or run:
```bash
npx cap doctor
```

---

**Happy Building! 🚀**
