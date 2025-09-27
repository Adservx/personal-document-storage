@echo off
echo Cleaning up old installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Installing dependencies...
npm install

echo Installation complete!
pause