# SecureDoc Manager

**Professional Document Storage and Management Platform**

A modern, secure, and user-friendly document management system built with React, TypeScript, and Supabase. Designed for individuals and professionals who need secure, organized, and accessible document storage.

**📱 Now available as a native Android app using Capacitor!** See [ANDROID_QUICKSTART.md](ANDROID_QUICKSTART.md) to get started.

## ✨ Features

### 🔐 Security & Authentication
- **Google Authentication**: Secure sign-in with Firebase Auth
- **User Isolation**: Each user can only access their own documents
- **Audit Logging**: Track all document operations
- **Secure File Storage**: Files stored in Supabase Storage with access controls

### 📁 Document Management
- **Multiple Categories**: Citizenship, Passport, Birth Certificate, Academic, Medical, Financial, Legal, Insurance, Employment, and Other
- **File Type Support**: Images (JPG, PNG, GIF, WebP), Documents (PDF, DOC, DOCX), Text files
- **File Size Limits**: Configurable limits per file type (up to 25MB for PDFs)
- **Metadata Support**: Descriptions, tags, version tracking
- **Search & Filter**: Real-time search across document names and descriptions
- **Preview**: Image preview in cards, file type icons for documents

### 🎨 Modern UI/UX
- **Professional Design**: Clean, modern interface with CSS variables
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme Support**: Theme switching capabilities
- **Loading States**: Professional loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and notifications
- **Accessibility**: Keyboard navigation and screen reader support

### 🚀 Technical Excellence
- **TypeScript**: Full type safety and enhanced developer experience
- **Modern React**: Hooks, context, and functional components
- **Professional Architecture**: Services, hooks, utilities, and components separation
- **Code Quality**: ESLint, Prettier, and TypeScript compiler checks
- **Performance**: Optimized bundle size and lazy loading

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Supabase (PostgreSQL + Storage)
- **Authentication**: Firebase Auth (Google)
- **Build Tool**: Create React App with TypeScript
- **Code Quality**: ESLint, Prettier, TypeScript
- **State Management**: React Context + Hooks
- **File Storage**: Supabase Storage

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Firebase project with Authentication enabled
- Supabase account and project (for storage)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd privateDOC
npm install
```

### 2. Firebase Setup

1. Create a new project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and add Google as a sign-in provider
3. Get your Firebase config from Project Settings

### 3. Supabase Setup (for storage)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL commands from `supabase-setup.sql`
4. Note your project URL and anon key from Settings → API

### 4. Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and Supabase credentials:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Supabase Configuration (for storage)
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Start Development Server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started

1. **Sign In**: Sign in with your Google account
2. **Choose Category**: Select a document category from the sidebar
3. **Upload Documents**: Click "Upload Document" and select files
4. **Organize**: Add descriptions and tags to your documents
5. **Search**: Use the search bar to find specific documents
6. **Download**: Click download to save documents to your device

### Document Categories

- **🏛️ Citizenship**: Citizenship certificates and naturalization documents
- **📘 Passport**: Passport and travel documents
- **👶 Birth Certificate**: Birth certificates and related documents
- **🎓 Academic Certificate**: Diplomas, degrees, and educational certificates
- **🏥 Medical Records**: Medical records, prescriptions, and health documents
- **💰 Financial Documents**: Bank statements, tax documents, and financial records
- **⚖️ Legal Documents**: Contracts, legal agreements, and court documents
- **🛡️ Insurance**: Insurance policies and claims
- **💼 Employment**: Employment contracts, pay stubs, and work documents
- **📄 Other**: Miscellaneous documents

### File Support

| Type | Extensions | Max Size | Preview |
|------|------------|----------|---------|
| Images | JPG, PNG, GIF, WebP | 10MB | ✅ Full preview |
| Documents | PDF | 25MB | 📄 Icon preview |
| Documents | DOC, DOCX | 10MB | 📝 Icon preview |
| Text | TXT | 1MB | 📋 Icon preview |

## 🔧 Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Theme, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services and data layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
└── App.tsx             # Main application component
```

### Available Scripts

```bash
# Development
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier
npm run type-check     # TypeScript type checking
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_FIREBASE_API_KEY` | Your Firebase API key | ✅ |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain | ✅ |
| `REACT_APP_FIREBASE_PROJECT_ID` | Your Firebase project ID | ✅ |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket | ✅ |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase messaging sender ID | ✅ |
| `REACT_APP_FIREBASE_APP_ID` | Your Firebase app ID | ✅ |
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL (for storage) | ✅ |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key (for storage) | ✅ |
| `REACT_APP_APP_NAME` | Application name | ❌ |
| `REACT_APP_ENVIRONMENT` | Environment (development/production) | ❌ |

## 🔒 Security Features

### Database Security
- **User Isolation**: Users can only access their own data
- **Secure Authentication**: Firebase handles JWT tokens and Google OAuth
- **SQL Injection Protection**: Parameterized queries via Supabase client

### File Security
- **Access Control**: Files are stored with user-specific paths
- **Storage Policies**: Database policies control file access
- **Secure URLs**: Time-limited signed URLs for file access

### Application Security
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Built into Firebase Auth
- **XSS Prevention**: React's built-in protection + proper escaping

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload `build/` folder to Netlify
3. Set environment variables in Netlify dashboard

### Deploy as Android App

See [ANDROID_QUICKSTART.md](ANDROID_QUICKSTART.md) for quick instructions or [CAPACITOR_GUIDE.md](CAPACITOR_GUIDE.md) for complete documentation.

**Quick steps:**
```bash
# 1. Sync to Android
npm run android:sync

# 2. Open in Android Studio
npm run android

# 3. Build APK/AAB from Android Studio
```

## 🐛 Troubleshooting

### Common Issues

**"Module not found" errors**
- Run `npm install` to ensure all dependencies are installed
- Check that all imports use the correct paths

**Firebase authentication issues**
- Verify your Firebase configuration in `.env.local`
- Check that Google sign-in is enabled in Firebase Console
- Ensure your Firebase project is active

**Supabase connection issues**
- Verify your `.env.local` file has correct Supabase values
- Check Supabase project URL and anon key
- Ensure your Supabase project is active

**File upload failures**
- Check file size limits
- Verify supported file types
- Ensure Supabase storage bucket exists

**Authentication issues**
- Clear browser localStorage/sessionStorage
- Check Firebase Auth settings and Google provider configuration
- Verify Firebase project permissions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using React, TypeScript, Firebase Auth, and Supabase Storage**