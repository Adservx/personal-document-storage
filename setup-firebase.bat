@echo off
echo Installing Firebase dependencies...
npm install firebase
echo.
echo Firebase setup complete!
echo.
echo Next steps:
echo 1. Create a Firebase project at https://console.firebase.google.com
echo 2. Enable Authentication and add Google as a sign-in provider
echo 3. Copy your Firebase config to .env.local
echo 4. Run 'npm start' to begin development
pause