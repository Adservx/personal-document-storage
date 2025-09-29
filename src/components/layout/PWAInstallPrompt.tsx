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
      localStorage.setItem('pwa-was-installed', 'true');
      return;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      localStorage.setItem('pwa-was-installed', 'true');
      return;
    }

    // Check if was previously installed
    if (localStorage.getItem('pwa-was-installed') === 'true') {
      setIsInstalled(true);
      return;
    }

    // Check localStorage for previous dismissal
    const dismissedBefore = localStorage.getItem('pwa-install-dismissed');
    if (dismissedBefore) {
      const dismissedTime = parseInt(dismissedBefore);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Show install prompt immediately (0 seconds)
      if (!dismissed && !isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-was-installed', 'true');
      console.log('PWA: App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For debugging: check PWA installability criteria and force prompt if needed
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        if (!deferredPrompt && !isInstalled && !dismissed) {
          console.log('PWA Debug: Install prompt not triggered. Check:');
          console.log('1. Service worker registered?', 'serviceWorker' in navigator);
          console.log('2. Manifest linked?', !!document.querySelector('link[rel="manifest"]'));
          console.log('3. HTTPS?', location.protocol === 'https:' || location.hostname === 'localhost');
          console.log('4. Icons available?', 'Check manifest.json icons');
          
          // Force show prompt for development testing (bypasses Chrome engagement heuristics)
          const forceShow = localStorage.getItem('pwa-force-prompt') === 'true';
          if (forceShow) {
            console.log('PWA: Forcing install prompt display for development');
            setShowInstallPrompt(true);
          }
        }
      }, 1000); // Reduced to 1 second for faster testing
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissed, isInstalled, deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('PWA: User accepted the install prompt');
        } else {
          console.log('PWA: User dismissed the install prompt');
          handleDismiss();
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('PWA: Install prompt failed:', error);
      }
    } else {
      // Fallback for browsers that don't support beforeinstallprompt or for forced prompts
      console.log('PWA: No deferred prompt available. Showing manual install instructions.');
      alert('To install this app:\n\nChrome Android: Menu → "Add to Home Screen"\niOS Safari: Share → "Add to Home Screen"\nDesktop: Browser menu → "Install app"');
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleLater = () => {
    setShowInstallPrompt(false);
    // Show again in current session after 30 minutes
    setTimeout(() => {
      if (!isInstalled && deferredPrompt) {
        setShowInstallPrompt(true);
      }
    }, 30 * 60 * 1000);
  };

  // Don't show if installed or dismissed, but allow showing for forced prompts
  const forceShow = process.env.NODE_ENV === 'development' && localStorage.getItem('pwa-force-prompt') === 'true';
  
  if (isInstalled || (dismissed && !forceShow) || !showInstallPrompt) {
    return null;
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
          <h3>Install SecureDoc Manager</h3>
          <p>Get the full app experience with offline access and notifications</p>
        </div>
        <div className="pwa-install-actions">
          <button 
            className="pwa-install-btn pwa-install-primary"
            onClick={handleInstallClick}
          >
            Install App
          </button>
          <button 
            className="pwa-install-btn pwa-install-secondary"
            onClick={handleLater}
          >
            Later
          </button>
          <button 
            className="pwa-install-btn pwa-install-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;