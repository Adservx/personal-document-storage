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
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Show install prompt after a short delay to not be too aggressive
      setTimeout(() => {
        if (!dismissed && !isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA: App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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
          handleDismiss();
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('PWA: Install prompt failed:', error);
      }
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

  // Don't show if installed or dismissed
  if (isInstalled || dismissed || !showInstallPrompt || !deferredPrompt) {
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
