@echo off
REM SecureDoc Manager - Quick Setup Script for Windows
REM This script helps you set up the SecureDoc Manager application quickly

echo 🚀 SecureDoc Manager - Quick Setup
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create environment file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating environment configuration file...
    copy .env.example .env.local
    echo ⚠️  Please edit .env.local with your Supabase credentials before running the app
    echo    You can get these from your Supabase project dashboard
) else (
    echo ✅ Environment file already exists
)

REM Check TypeScript
echo 🔨 Checking TypeScript compilation...
call npm run type-check
if %errorlevel% neq 0 (
    echo ⚠️  TypeScript errors found - please fix before production deployment
)

REM Run linting
echo 🧹 Running code quality checks...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Linting errors found - please fix for better code quality
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Set up your Supabase project:
echo    - Create a new project at https://supabase.com
echo    - Run the SQL from 'supabase-setup.sql' in your SQL editor
echo    - Copy your project URL and anon key
echo.
echo 2. Configure environment:
echo    - Edit .env.local with your Supabase credentials
echo.
echo 3. Start development server:
echo    npm start
echo.
echo 📚 For detailed instructions, see README.md
echo 🚀 For deployment guide, see DEPLOYMENT.md
echo.
echo Need help? Open an issue on GitHub or check the documentation.

pause