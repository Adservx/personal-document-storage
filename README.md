# SecureDoc Manager

**Professional Document Storage and Management Platform**

A modern, secure, and user-friendly document management system built with React, TypeScript, and Supabase. Designed for individuals and professionals who need secure, organized, and accessible document storage.

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
git clone https://github.com/Adservx/personal-document-storage.git
cd personal-document-storage
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

Create a `.env.local` file with your Firebase and Supabase credentials:

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

## 🚀 Deployment

### Deploy to Vercel

The project is configured for easy deployment to Vercel with the included `vercel.json` configuration.

1. Connect your GitHub repository to Vercel
2. Set the required environment variables in your Vercel dashboard
3. Deploy automatically on every push to main branch

## 📞 Support

For support, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, Firebase Auth, and Supabase Storage**