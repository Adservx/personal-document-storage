# Capacitor Google Authentication Setup (Without Google Auth Plugin)

This guide explains how to configure Google authentication in Capacitor using Firebase Auth with redirect flow, **without** requiring the Capacitor Google Auth plugin.

## ✅ Changes Applied

1. **Installed @capacitor/browser** - For proper browser-based authentication flow
2. **Updated AuthContext.tsx** - Added platform detection to use redirect flow on native platforms
3. **Updated capacitor.config.ts** - Added allowNavigation for Firebase auth domains
4. **Updated AndroidManifest.xml** - Added deep link intent filter for auth redirects

## 🔧 Firebase Console Configuration Required

### Step 1: Add Authorized Domains

Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Authentication → Settings → Authorized domains

Add the following domains:
- `localhost` (for local development)
- `com.securedoc.manager` (your app's custom scheme)
- Your production domain (if deploying to web)

### Step 2: Configure OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to: APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID (Web client)
5. Add the following Authorized redirect URIs:
   ```
   https://paworld9.firebaseapp.com/__/auth/handler
   http://localhost
   https://com.securedoc.manager/__/auth/handler
   ```

### Step 3: Android SHA-1 Fingerprint (For Android App)

If you haven't already, add your Android app's SHA-1 fingerprint to Firebase:

1. Generate debug keystore fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```
   
2. Copy the SHA-1 fingerprint from the output

3. Go to Firebase Console → Project Settings → Your Android App
4. Add the SHA-1 fingerprint

## 🚀 How to Test

### Web (Development)
```bash
npm start
```
- Click "Sign in with Google"
- Should use popup authentication (with fallback to redirect)

### Android (Development)
```bash
npm run android:run
```
- Click "Sign in with Google"
- Will automatically use redirect authentication
- Browser will open for Google sign-in
- After authentication, will redirect back to your app

## 🔍 How It Works

### Platform Detection
The app automatically detects whether it's running on:
- **Web**: Uses `signInWithPopup` (faster, better UX)
- **Native (Android/iOS)**: Uses `signInWithRedirect` (works in native webview)

### Authentication Flow
1. User clicks "Sign in with Google"
2. Platform is detected via `Capacitor.isNativePlatform()`
3. **On Native**:
   - Opens Firebase auth URL in system browser or webview
   - User authenticates with Google
   - Redirects back to app using deep link
   - `getRedirectResult()` captures the auth token
4. **On Web**:
   - Opens popup window
   - User authenticates
   - Popup closes automatically
   - Auth state updated

## 🐛 Troubleshooting

### Issue: "unauthorized-domain" error
**Solution**: Add `com.securedoc.manager` to Firebase Console → Authentication → Authorized domains

### Issue: Redirect not working after Google sign-in
**Solution**: 
1. Verify the deep link intent filter is in `AndroidManifest.xml`
2. Ensure `https://com.securedoc.manager/__/auth/handler` is in Google OAuth redirect URIs
3. Check that SHA-1 fingerprint is added to Firebase for Android app

### Issue: Popup blocked on web
**Solution**: The app automatically falls back to redirect method. No action needed.

### Issue: Auth state not persisting
**Solution**: Firebase Auth persistence is automatic. Check that:
- IndexedDB is not disabled in browser/webview
- No aggressive clear data policies in Capacitor config

## 📝 Key Files Modified

- `src/contexts/AuthContext.tsx` - Added Capacitor platform detection
- `capacitor.config.ts` - Added allowNavigation for Firebase domains
- `android/app/src/main/AndroidManifest.xml` - Added deep link intent filter
- `package.json` - Added @capacitor/browser dependency

## 🔐 Security Notes

- Deep links use HTTPS scheme for security
- OAuth redirect URIs are verified by Google
- Firebase handles token refresh automatically
- Auth state persists securely via Firebase Auth

## 📦 Next Steps

1. Add your SHA-1 fingerprint to Firebase Console
2. Add authorized domains to Firebase
3. Add redirect URIs to Google Cloud Console
4. Build and test on Android device
5. For iOS, similar setup will be needed (see iOS configuration)

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify all Firebase configuration steps
3. Ensure package.json has `@capacitor/browser` installed
4. Run `npx cap sync` after any config changes
