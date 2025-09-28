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
      // Force installation for browsers without native prompt
      console.log('PWA: No native prompt available, attempting forced installation');
      
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = /android/.test(userAgent);
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isChrome = /chrome/.test(userAgent) && !(/edg/.test(userAgent));
      const isSafari = /safari/.test(userAgent) && !(/chrome/.test(userAgent));
      const isFirefox = /firefox/.test(userAgent);
      
      // Try to trigger actual installation based on browser
      if (isAndroid && isChrome) {
        // Android Chrome - Look for install button in address bar
        const installHint = document.createElement('div');
        installHint.style.cssText = `
          position: fixed;
          top: 10px;
          left: 10px;
          right: 10px;
          background: #3b82f6;
          color: white;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          z-index: 70000;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: fadeIn 0.3s ease;
        `;
        installHint.innerHTML = '📱 Look for the install icon (⬇️) in your address bar above and tap it to install!';
        document.body.appendChild(installHint);
        
        // Remove hint after 10 seconds
        setTimeout(() => {
          if (document.body.contains(installHint)) {
            document.body.removeChild(installHint);
          }
        }, 10000);
        
      } else if (isIOS && isSafari) {
        // iOS Safari - Share button method
        const installHint = document.createElement('div');
        installHint.style.cssText = `
          position: fixed;
          bottom: 80px;
          left: 10px;
          right: 10px;
          background: #3b82f6;
          color: white;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          z-index: 70000;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          animation: bounce 1s infinite;
        `;
        installHint.innerHTML = '📱 Tap the Share button (⬆️) at the bottom, then "Add to Home Screen" to install!';
        document.body.appendChild(installHint);
        
        // Highlight the share button area
        document.body.style.paddingBottom = '100px';
        
        // Remove hint after 15 seconds
        setTimeout(() => {
          if (document.body.contains(installHint)) {
            document.body.removeChild(installHint);
            document.body.style.paddingBottom = '';
          }
        }, 15000);
        
      } else {
        // Other browsers - redirect to Chrome for proper PWA installation
        console.log('PWA: Redirecting to proper browser for installation');
        
        const redirectDiv = document.createElement('div');
        redirectDiv.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #3b82f6;
          color: white;
          padding: 2rem;
          border-radius: 16px;
          font-size: 1.125rem;
          font-weight: 600;
          z-index: 70000;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          max-width: 400px;
          width: 90%;
        `;
        redirectDiv.innerHTML = `
          <div style="margin-bottom: 1rem;">🚀 Installing SecureDoc Manager</div>
          <div style="font-size: 1rem; margin-bottom: 1.5rem;">
            Redirecting to Chrome for proper PWA installation...
          </div>
          <div style="font-size: 0.875rem; opacity: 0.9;">
            You'll be redirected in 3 seconds
          </div>
        `;
        document.body.appendChild(redirectDiv);
        
        // Get current URL
        const currentUrl = window.location.href;
        
        // Redirect to Chrome with installation intent
        setTimeout(() => {
          // Try different methods to open in Chrome
          const chromeUrls = [
            `googlechrome://${currentUrl}`, // Chrome mobile protocol
            `intent://${currentUrl.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`, // Android Chrome intent
            currentUrl // Fallback to current URL
          ];
          
          // Try Chrome mobile first
          if (isAndroid) {
            try {
              window.location.href = chromeUrls[1]; // Android Chrome intent
            } catch (error) {
              // Fallback to Chrome protocol
              try {
                window.location.href = chromeUrls[0];
              } catch (error2) {
                // Final fallback - open in current browser but mark as needing Chrome
                const needsChromeDiv = document.createElement('div');
                needsChromeDiv.style.cssText = `
                  position: fixed;
                  top: 10px;
                  left: 10px;
                  right: 10px;
                  background: #dc2626;
                  color: white;
                  padding: 1rem;
                  border-radius: 12px;
                  font-size: 1rem;
                  font-weight: 600;
                  z-index: 70000;
                  text-align: center;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                `;
                needsChromeDiv.innerHTML = '📱 Please install Chrome browser and open this app in Chrome for proper PWA installation!';
                document.body.appendChild(needsChromeDiv);
                
                // Remove redirect div
                if (document.body.contains(redirectDiv)) {
                  document.body.removeChild(redirectDiv);
                }
              }
            }
          } else {
            // Desktop - provide Chrome download link
            window.open('https://www.google.com/chrome/', '_blank');
            
            // Update redirect message
            redirectDiv.innerHTML = `
              <div style="margin-bottom: 1rem;">🚀 Installing SecureDoc Manager</div>
              <div style="font-size: 1rem; margin-bottom: 1.5rem;">
                Please install Chrome browser and return to this page for proper PWA installation.
              </div>
              <div style="font-size: 0.875rem; opacity: 0.9;">
                Chrome download page opened in new tab
              </div>
            `;
          }
        }, 3000);
        
        // Remove redirect div after 10 seconds
        setTimeout(() => {
          if (document.body.contains(redirectDiv)) {
            document.body.removeChild(redirectDiv);
          }
        }, 10000);
      }
      
      // Don't mark as installed - keep prompting until actually installed
      console.log('PWA: Waiting for actual installation...');
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
            🚀 Install App Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
