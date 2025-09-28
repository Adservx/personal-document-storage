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
      
      // Try to directly trigger Add to Home Screen for each browser
      if (isAndroid && isChrome) {
        // Android Chrome - Try to programmatically trigger install
        try {
          // Method 1: Look for and click install button
          const installButton = document.querySelector('[data-action="install"]') as HTMLElement;
          if (installButton) {
            installButton.click();
            return;
          }
          
          // Method 2: Try to trigger menu action
          const menu = document.querySelector('[aria-label="Main menu"]') as HTMLElement;
          if (menu) {
            menu.click();
            setTimeout(() => {
              const addToHomeScreen = document.querySelector('[data-action="add-to-homescreen"]') as HTMLElement;
              if (addToHomeScreen) addToHomeScreen.click();
            }, 100);
            return;
          }
          
          // Method 3: Create artificial install event
          const installEvent = new CustomEvent('beforeinstallprompt', {
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(installEvent);
          
        } catch (error) {
          console.log('PWA: Failed to trigger automatic install, showing guidance');
        }
        
        // Create overlay that guides to install button
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 60000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 20px;
        `;
        
        const arrow = document.createElement('div');
        arrow.style.cssText = `
          color: #3b82f6;
          font-size: 3rem;
          animation: bounce 1s infinite;
          text-align: center;
        `;
        arrow.innerHTML = '⬇️<br><span style="font-size: 1rem; color: white;">Tap the install icon above</span>';
        
        overlay.appendChild(arrow);
        document.body.appendChild(overlay);
        
        // Remove overlay when clicked
        overlay.onclick = () => document.body.removeChild(overlay);
        
      } else if (isIOS && isSafari) {
        // iOS Safari - Create overlay pointing to share button
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 60000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 100px;
        `;
        
        const arrow = document.createElement('div');
        arrow.style.cssText = `
          color: #3b82f6;
          font-size: 3rem;
          animation: bounce 1s infinite;
          text-align: center;
        `;
        arrow.innerHTML = '⬆️<br><span style="font-size: 1rem; color: white;">Tap Share, then "Add to Home Screen"</span>';
        
        overlay.appendChild(arrow);
        document.body.appendChild(overlay);
        
        // Remove overlay when clicked
        overlay.onclick = () => document.body.removeChild(overlay);
        
      } else if (isFirefox) {
        // Firefox - Try to trigger install
        try {
          // Create install event for Firefox
          window.location.href = `data:text/html,<script>
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js');
            }
            setTimeout(() => {
              window.history.back();
            }, 100);
          </script>`;
        } catch (error) {
          // Show Firefox-specific guidance
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #3b82f6;
            color: white;
            padding: 2rem;
            border-radius: 16px;
            font-size: 1.125rem;
            z-index: 70000;
            text-align: center;
            max-width: 400px;
          `;
          overlay.innerHTML = `
            <div style="margin-bottom: 1rem;">🦊 Firefox Installation</div>
            <div style="font-size: 1rem;">
              Firefox: Menu → Install → Add to Home Screen
            </div>
          `;
          document.body.appendChild(overlay);
          setTimeout(() => document.body.removeChild(overlay), 5000);
        }
        
      } else {
        // Generic browser - try universal methods
        try {
          // Method 1: Try to find browser-specific install elements
          const possibleSelectors = [
            '[aria-label*="install" i]',
            '[aria-label*="add to home" i]',
            '[data-action*="install"]',
            '[data-testid*="install"]',
            '.install-button',
            '#install-button'
          ];
          
          for (const selector of possibleSelectors) {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
              element.click();
              return;
            }
          }
          
          // Method 2: Try keyboard shortcut for some browsers
          const event = new KeyboardEvent('keydown', {
            ctrlKey: true,
            shiftKey: true,
            key: 'A'
          });
          document.dispatchEvent(event);
          
        } catch (error) {
          console.log('PWA: Universal install methods failed');
        }
        
        // Show browser menu guidance overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 60000;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        const guide = document.createElement('div');
        guide.style.cssText = `
          background: #3b82f6;
          color: white;
          padding: 2rem;
          border-radius: 16px;
          font-size: 1.125rem;
          text-align: center;
          max-width: 400px;
        `;
        guide.innerHTML = `
          <div style="margin-bottom: 1rem;">📱 Install App</div>
          <div style="font-size: 1rem; margin-bottom: 1rem;">
            Look for "Install", "Add to Home Screen", or "Create Shortcut" in your browser menu
          </div>
          <div style="font-size: 0.875rem; opacity: 0.9;">
            Usually found in: Menu (⋮) → Install/Add to Home Screen
          </div>
        `;
        
        overlay.appendChild(guide);
        document.body.appendChild(overlay);
        
        // Remove overlay when clicked
        overlay.onclick = () => document.body.removeChild(overlay);
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
