import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // PWA Installation is now REQUIRED - no dismissal allowed

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Show install prompt immediately when event fires - REQUIRED
      if (!isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA: App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt after 0.1 seconds for ALL devices - AGGRESSIVE DETECTION
    const showPromptTimer = setTimeout(() => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Debug logging
      console.log('PWA Debug - User Agent:', userAgent);
      console.log('PWA Debug - isInstalled:', isInstalled);
      console.log('PWA Debug - dismissed:', dismissed);
      console.log('PWA Debug - Service Worker support:', 'serviceWorker' in navigator);
      console.log('PWA Debug - Display mode:', window.matchMedia('(display-mode: standalone)').matches);
      
      // AGGRESSIVE detection - show for EVERY device/browser
      const isPWACapable = true; // Force show on ALL devices for testing
      
      // Alternative detailed detection (for debugging)
      const detailedDetection = 
        // Service Worker support (core PWA requirement)
        'serviceWorker' in navigator ||
        // Chrome/Chromium based browsers (all devices)
        /chrome|chromium|crios/.test(userAgent) ||
        // Edge (all devices)
        /edge|edg/.test(userAgent) ||
        // Firefox (desktop and mobile)
        /firefox|fxios/.test(userAgent) ||
        // Safari (iOS and macOS)
        /safari/.test(userAgent) ||
        // Samsung Internet
        /samsungbrowser/.test(userAgent) ||
        // Opera (all devices)
        /opera|opr/.test(userAgent) ||
        // UC Browser
        /ucbrowser/.test(userAgent) ||
        // Brave Browser
        /brave/.test(userAgent) ||
        // Mobile browsers
        /mobile/.test(userAgent) ||
        // Tablet detection
        /tablet|ipad/.test(userAgent) ||
        // Android devices
        /android/.test(userAgent) ||
        // iOS devices
        /iphone|ipod|ipad/.test(userAgent) ||
        // Desktop/laptop detection
        /windows|macintosh|linux/.test(userAgent) ||
        // PWA-specific checks
        'BeforeInstallPromptEvent' in window ||
        'getInstalledRelatedApps' in navigator ||
        window.matchMedia('(display-mode: browser)').matches;

      console.log('PWA Debug - Detailed detection result:', detailedDetection);
      console.log('PWA Debug - Will show prompt:', isPWACapable && !isInstalled);

      // Show for ALL capable browsers and devices - REQUIRED
      if (isPWACapable && !isInstalled) {
        console.log('PWA Debug - Showing install prompt NOW');
        setShowInstallPrompt(true);
      } else {
        console.log('PWA Debug - NOT showing prompt. isInstalled:', isInstalled);
      }
    }, 100); // 0.1 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(showPromptTimer);
    };
  }, [dismissed, isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted the install prompt');
        } else {
          console.log('PWA: User dismissed the install prompt');
          // No dismissal - installation is required
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('PWA: Install prompt failed:', error);
      }
    } else {
      // Comprehensive fallback for all devices without native install prompt
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobile = /mobile/.test(userAgent);
      const isTablet = /tablet|ipad/.test(userAgent);
      const isDesktop = !isMobile && !isTablet;
      const isChrome = /chrome/.test(userAgent);
      const isFirefox = /firefox/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isEdge = /edge|edg/.test(userAgent);
      const isSamsung = /samsungbrowser/.test(userAgent);
      
      let instructions = 'To install SecureDoc Manager:\n\n';
      
      if (isIOS) {
        instructions += '📱 iOS (iPhone/iPad):\n';
        instructions += '1. Tap the Share button (⬆️)\n';
        instructions += '2. Scroll and tap "Add to Home Screen"\n';
        instructions += '3. Tap "Add" to install\n';
      } else if (isAndroid && isChrome) {
        instructions += '📱 Android Chrome:\n';
        instructions += '1. Tap the menu (⋮) in browser\n';
        instructions += '2. Select "Add to Home screen"\n';
        instructions += '3. Tap "Add" to install\n';
      } else if (isAndroid && isSamsung) {
        instructions += '📱 Samsung Internet:\n';
        instructions += '1. Tap the menu (≡) button\n';
        instructions += '2. Select "Add page to"\n';
        instructions += '3. Choose "Home screen"\n';
      } else if (isAndroid) {
        instructions += '📱 Android:\n';
        instructions += '1. Look for install icon in address bar\n';
        instructions += '2. Or use browser menu > "Install app"\n';
        instructions += '3. Follow installation prompts\n';
      } else if (isDesktop && isChrome) {
        instructions += '💻 Desktop Chrome:\n';
        instructions += '1. Look for install icon (⬇️) in address bar\n';
        instructions += '2. Or click menu (⋮) > "Install SecureDoc Manager"\n';
        instructions += '3. Click "Install" in dialog\n';
      } else if (isDesktop && isEdge) {
        instructions += '💻 Microsoft Edge:\n';
        instructions += '1. Look for install icon (⬇️) in address bar\n';
        instructions += '2. Or click menu (...) > "Apps" > "Install this site as an app"\n';
        instructions += '3. Click "Install"\n';
      } else if (isDesktop && isFirefox) {
        instructions += '💻 Firefox:\n';
        instructions += '1. Look for install icon in address bar\n';
        instructions += '2. Or bookmark this page for quick access\n';
        instructions += '3. Consider using Chrome/Edge for full PWA support\n';
      } else if (isDesktop && isSafari) {
        instructions += '💻 Safari (macOS):\n';
        instructions += '1. Click "File" menu > "Add to Dock"\n';
        instructions += '2. Or bookmark for quick access\n';
        instructions += '3. Consider using Chrome/Edge for full PWA support\n';
      } else if (isTablet) {
        instructions += '📱 Tablet:\n';
        instructions += '1. Look for install option in browser menu\n';
        instructions += '2. Or use "Add to Home screen" option\n';
        instructions += '3. Follow device-specific prompts\n';
      } else {
        instructions += '🌐 Your Browser:\n';
        instructions += '1. Look for install icon in address bar\n';
        instructions += '2. Check browser menu for "Install" option\n';
        instructions += '3. Add bookmark for quick access\n';
      }
      
      instructions += '\n✨ Enjoy offline access and app-like experience!';
      
      alert(instructions);
      setShowInstallPrompt(false);
    }
  };

  // No dismiss functionality - PWA installation is REQUIRED

  // For debugging - always show a small test component
  if (isInstalled || !showInstallPrompt) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'red',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 60000,
        fontSize: '12px'
      }}>
        PWA Debug: {isInstalled ? 'Installed' : 'Not showing prompt'}
        <br />
        <button 
          onClick={() => setShowInstallPrompt(true)}
          style={{ marginTop: '5px', padding: '5px', fontSize: '10px' }}
        >
          Force Show
        </button>
      </div>
    );
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 2L13.4 6.4L18 6L14.9 9.1L16 14L12 11.5L8 14L9.1 9.1L6 6L10.6 6.4L12 2Z" 
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="pwa-install-text">
          <h3>🚀 Install SecureDoc Manager</h3>
          <p>This app requires installation for the best experience with offline access, encryption, and security features.</p>
          <div className="pwa-install-features">
            <div className="feature-item">🔒 End-to-end encryption</div>
            <div className="feature-item">📱 Offline document access</div>
            <div className="feature-item">🔄 Auto-sync across devices</div>
            <div className="feature-item">⚡ Fast performance</div>
          </div>
        </div>
        <div className="pwa-install-actions">
          <button 
            className="pwa-install-btn pwa-install-primary pwa-install-required"
            onClick={handleInstallClick}
          >
            🚀 Install Now - Required
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
