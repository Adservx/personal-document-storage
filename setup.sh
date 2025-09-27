#!/bin/bash

# SecureDoc Manager - Quick Setup Script
# This script helps you set up the SecureDoc Manager application quickly

set -e

echo "🚀 SecureDoc Manager - Quick Setup"
echo "=================================="

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment configuration file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your Supabase credentials before running the app"
    echo "   You can get these from your Supabase project dashboard"
else
    echo "✅ Environment file already exists"
fi

# Build TypeScript
echo "🔨 Checking TypeScript compilation..."
npm run type-check || echo "⚠️  TypeScript errors found - please fix before production deployment"

# Run linting
echo "🧹 Running code quality checks..."
npm run lint || echo "⚠️  Linting errors found - please fix for better code quality"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Set up your Supabase project:"
echo "   - Create a new project at https://supabase.com"
echo "   - Run the SQL from 'supabase-setup.sql' in your SQL editor"
echo "   - Copy your project URL and anon key"
echo ""
echo "2. Configure environment:"
echo "   - Edit .env.local with your Supabase credentials"
echo ""
echo "3. Start development server:"
echo "   npm start"
echo ""
echo "📚 For detailed instructions, see README.md"
echo "🚀 For deployment guide, see DEPLOYMENT.md"
echo ""
echo "Need help? Open an issue on GitHub or check the documentation."