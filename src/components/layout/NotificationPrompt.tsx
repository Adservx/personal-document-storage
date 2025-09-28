import React, { useState, useEffect } from 'react';
import './NotificationPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const NotificationPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [notificationType, setNotificationType] = useState<'install' | 'open'>('install');

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    console.log('PWA Notification Debug:', {
      isStandaloneMode,
      localStorage_wasInstalled: localStorage.getItem('pwa-was-installed'),
      localStorage_installDismissed: localStorage.getItem('pwa-install-dismissed'),
      localStorage_openDismissed: localStorage.getItem('pwa-open-dismissed')
    });

    // Check if PWA is installed but user is browsing in regular browser
    const isInstalledPWA = 'serviceWorker' in navigator && 
      (localStorage.getItem('pwa-was-installed') === 'true' || 
       sessionStorage.getItem('pwa-detected') === 'true');

    setIsInstalled(isInstalledPWA);

    // Don't show notifications in standalone mode
    if (isStandaloneMode) {
      console.log('PWA Notification: Skipping - in standalone mode');
      return;
    }

    // Check localStorage for previous dismissals
    const installDismissed = localStorage.getItem('pwa-install-dismissed');
    const openDismissed = localStorage.getItem('pwa-open-dismissed');

    // If PWA is installed but user is browsing in browser
    if (isInstalledPWA && !isStandaloneMode) {
      if (openDismissed) {
        const dismissedTime = parseInt(openDismissed);
        const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
        
        // Show "open in app" again after 24 hours
        if (hoursSinceDismissed < 24) {
          setDismissed(true);
          return;
        }
      }

      // Show "open in app" notification
      setNotificationType('open');
      setTimeout(() => setShowNotification(true), 100); // Show after 0.1 seconds
      return;
    }

    // Handle install prompt for non-installed PWA
    if (installDismissed) {
      const dismissedTime = parseInt(installDismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show install prompt again after 7 days
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      setNotificationType('install');
      
      // Show install prompt after short delay
      if (!dismissed) {
        setTimeout(() => setShowNotification(true), 100);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowNotification(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-was-installed', 'true');
      console.log('PWA: App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback: If no beforeinstallprompt event after 1 second, show install notification anyway
    setTimeout(() => {
      if (!deferredPrompt && !isInstalledPWA && !isStandaloneMode && !dismissed) {
        console.log('PWA Notification: Showing fallback install notification');
        setNotificationType('install');
        setShowNotification(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    const userAgent = navigator.userAgent;
    let detectedBrowser = 'unknown';
    
    // Check for Brave first (it includes "Chrome" in user agent)
    if ((navigator as any).brave && (navigator as any).brave.isBrave) {
      detectedBrowser = 'Brave';
    } else if (userAgent.includes('Brave')) {
      detectedBrowser = 'Brave';
    } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
      detectedBrowser = 'Opera';
    } else if (userAgent.includes('Edg')) {
      detectedBrowser = 'Edge';
    } else if (userAgent.includes('Chrome')) {
      detectedBrowser = 'Chrome';
    } else if (userAgent.includes('Chromium')) {
      detectedBrowser = 'Chromium';
    } else if (userAgent.includes('Firefox')) {
      detectedBrowser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      detectedBrowser = 'Safari';
    }
    
    console.log(`PWA: Install button clicked - Detected browser: ${detectedBrowser}`);
    
    if (deferredPrompt) {
      // Use the proper PWA install prompt (works for all Chromium browsers: Chrome, Edge, Brave, Opera, etc.)
      try {
        console.log(`PWA: Using native browser install dialog for ${detectedBrowser}`);
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted the install prompt');
          localStorage.setItem('pwa-was-installed', 'true');
          setIsInstalled(true);
        } else {
          console.log('PWA: User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
        setShowNotification(false);
      } catch (error) {
        console.error('PWA: Install prompt failed:', error);
        setShowNotification(false);
      }
    } else {
      // No deferred prompt available - try to force trigger browser install mechanisms
      console.log(`PWA: No deferred prompt available for ${detectedBrowser} - attempting to trigger install`);
      
      try {
        // For Chromium browsers (including Brave), try to force the install prompt
        if (['Brave', 'Chrome', 'Edge', 'Opera', 'Chromium'].includes(detectedBrowser)) {
          console.log(`PWA: Attempting to force install prompt for Chromium browser: ${detectedBrowser}`);
          
          // Method 1: Try to manually trigger beforeinstallprompt
          const installPromptEvent = new Event('beforeinstallprompt', { cancelable: true });
          
          // Create a more realistic deferred prompt object
          const mockDeferredPrompt = {
            prompt: async () => {
              console.log(`PWA: Mock install prompt triggered for ${detectedBrowser}`);
              
              // Try to use Brave's install API if available
              if (detectedBrowser === 'Brave' && (window as any).chrome && (window as any).chrome.runtime) {
                try {
                  // Check if Brave has special install methods
                  if ((window as any).chrome.runtime.sendMessage) {
                    (window as any).chrome.runtime.sendMessage({ action: 'install_pwa' });
                  }
                } catch (e) {
                  console.log('PWA: Brave special install method not available');
                }
              }
              
              // For all Chromium browsers, show guidance to browser install button
              const installGuide = document.createElement('div');
              installGuide.innerHTML = `
                <div style="
                  position: fixed;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: rgba(0, 0, 0, 0.95);
                  color: white;
                  padding: 24px;
                  border-radius: 16px;
                  z-index: 70000;
                  text-align: center;
                  max-width: 350px;
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                ">
                  <div style="font-size: 24px; margin-bottom: 16px;">📱 Install App</div>
                  <div style="margin-bottom: 20px; line-height: 1.4;">
                    Look for the <strong>Install</strong> or <strong>⬇️</strong> button in your ${detectedBrowser} address bar and click it!
                  </div>
                  <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                  ">Got it!</button>
                </div>
              `;
              document.body.appendChild(installGuide);
              
              return Promise.resolve();
            },
            userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' })
          };
          
          // Set this as our deferred prompt
          setDeferredPrompt(mockDeferredPrompt as any);
          
          // Try to trigger the install prompt immediately
          await mockDeferredPrompt.prompt();
          
        } else {
          // For non-Chromium browsers
          console.log(`PWA: Non-Chromium browser detected: ${detectedBrowser}`);
          
          // Safari iOS - trigger the Web Share API
          if (detectedBrowser === 'Safari' && 'share' in navigator) {
            await (navigator as any).share({
              title: document.title,
              text: 'Install this app for the best experience',
              url: window.location.href
            });
          } else {
            // Show generic install guidance
            alert(`To install this app in ${detectedBrowser}:\n\n• Look for "Install" or "Add to Home Screen" in your browser menu\n• Or check the address bar for an install button`);
          }
        }
        
        // Mark that user attempted install
        localStorage.setItem('pwa-install-attempted', Date.now().toString());
        
        // Hide notification after attempt
        setTimeout(() => {
          setShowNotification(false);
        }, 1500);
        
      } catch (error) {
        console.error('PWA: Install fallback method failed:', error);
        setShowNotification(false);
      }
    }
  };

  const handleOpenInApp = () => {
    // Try to open in app using various methods
    const appUrl = window.location.href;
    
    // For Android Chrome
    if ('navigator' in window && 'share' in navigator) {
      // Try to trigger app selector
      window.location.href = appUrl;
    } else {
      // Fallback - show instructions
      setNotificationType('install'); // Switch to install instructions
    }
    
    setShowNotification(false);
    handleDismiss();
  };

  const handleDismiss = () => {
    setShowNotification(false);
    setDismissed(true);
    
    if (notificationType === 'install') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    } else {
      localStorage.setItem('pwa-open-dismissed', Date.now().toString());
    }
  };

  const handleLater = () => {
    setShowNotification(false);
    
    // Show again in current session based on type
    const delay = notificationType === 'install' ? 30 * 60 * 1000 : 60 * 60 * 1000; // 30min for install, 1hr for open
    
    setTimeout(() => {
      if (!isStandalone && (notificationType === 'open' || deferredPrompt)) {
        setShowNotification(true);
      }
    }, delay);
  };

  // Debug logging for visibility
  console.log('PWA Notification Render Check:', {
    isStandalone,
    dismissed,
    showNotification,
    notificationType,
    deferredPrompt: !!deferredPrompt
  });

  // Don't show if in standalone mode or dismissed
  if (isStandalone || dismissed) {
    return null;
  }

  // Show notification if showNotification is true
  if (!showNotification) {
    return null;
  }

  return (
    <div className={`notification-prompt ${notificationType === 'open' ? 'notification-open' : 'notification-install'}`}>
      <div className="notification-content">
        <button 
          className="notification-close"
          onClick={handleDismiss}
          aria-label="Close notification"
        >
          ×
        </button>
        
        <div className="notification-icon">
          {notificationType === 'install' ? (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M12 2L13.4 6.4L18 6L14.9 9.1L16 14L12 11.5L8 14L9.1 9.1L6 6L10.6 6.4L12 2Z" 
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M19 7H18V6C18 5.45 17.55 5 17 5H7C6.45 5 6 5.45 6 6V18C6 18.55 6.45 19 7 19H17C17.55 19 18 18.55 18 18V17H19C19.55 17 20 16.55 20 16V8C20 7.45 19.55 7 19 7Z" 
                fill="currentColor"
              />
              <path 
                d="M16 8V16H8V8H16Z" 
                fill="currentColor" 
                fillOpacity="0.3"
              />
            </svg>
          )}
        </div>
        
        <div className="notification-text">
          <h4>
            {notificationType === 'install' 
              ? 'Install SecureDoc Manager' 
              : 'Open in App'
            }
          </h4>
          <p>
            {notificationType === 'install' 
              ? 'Get the full experience with offline access and faster performance'
              : 'For the best experience, open SecureDoc Manager in the app'
            }
          </p>
        </div>
        
        <div className="notification-actions">
          <button 
            className="notification-btn notification-primary"
            onClick={notificationType === 'install' ? handleInstallClick : handleOpenInApp}
          >
            {notificationType === 'install' ? 'Install' : 'Open App'}
          </button>
          <button 
            className="notification-btn notification-secondary"
            onClick={handleLater}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
