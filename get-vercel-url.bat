@echo off
echo Getting Vercel deployment URL...
vercel ls personal-document-storage
echo.
echo Add the above URL to Firebase Console:
echo 1. Go to https://console.firebase.google.com
echo 2. Select project 'paworld9'
echo 3. Go to Authentication ^> Settings ^> Authorized domains
echo 4. Click 'Add domain' and add your Vercel URL
pause