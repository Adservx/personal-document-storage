import React from 'react';
// PWA-enabled SecureDoc Manager
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';
import { MainApp } from './components/MainApp';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import usePWA from './hooks/usePWA';
import './styles/design-system.css';
import './styles/document-theme.css';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const { isSupported, updateAvailable } = usePWA();

  React.useEffect(() => {
    // Apply theme class to body for consistent theming
    document.body.className = isDark ? 'dark' : 'light';
    
    // Set theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0d1117' : '#ffffff');
    }
    
    // Prevent flash of unstyled content
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  if (authLoading) {
    return (
      <div className="loading-container animate-fade-in">
        <div className="loading-content">
          <LoadingSpinner 
            size="large" 
            variant="spinner" 
            text="Loading SecureDoc Manager..."
          />
          <div className="loading-features">
            <div className="feature-highlight animate-fade-in animate-stagger-1">
              <span className="feature-icon">🔒</span>
              <span>Secure & Encrypted</span>
            </div>
            <div className="feature-highlight animate-fade-in animate-stagger-2">
              <span className="feature-icon">☁️</span>
              <span>Cloud Storage</span>
            </div>
            <div className="feature-highlight animate-fade-in animate-stagger-3">
              <span className="feature-icon">📱</span>
              <span>Mobile Friendly</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-container theme-transition">
        {!user ? <LoginPage /> : <MainApp />}
        {updateAvailable && (
          <div className="pwa-update-banner">
            <p>A new version is available!</p>
            <button onClick={() => window.location.reload()}>Update</button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;