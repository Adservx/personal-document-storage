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

    // Check if user bypassed installation previously
    if (localStorage.getItem('pwa-bypass-install')) {
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
    console.log('PWA: Install button clicked');
    
    if (deferredPrompt) {
      try {
        console.log('PWA: Using native install prompt');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted the install prompt');
          setIsInstalled(true);
          setShowInstallPrompt(false);
        } else {
          console.log('PWA: User dismissed the install prompt');
          // Keep showing prompt since installation is required
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('PWA: Install prompt failed:', error);
      }
    } else {
      // If no native prompt is available, just mark as installed and proceed
      console.log('PWA: No native prompt available, proceeding with app access');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-bypass-install', 'true');
      
      // Show a brief success message
      const successDiv = document.createElement('div');
      successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-size: 1.25rem;
        font-weight: 600;
        z-index: 70000;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      `;
      successDiv.innerHTML = '✅ App Ready!<br><small>You can now use SecureDoc Manager</small>';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 2000);
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
            {deferredPrompt ? '🚀 Install App' : '✅ Continue to App'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
