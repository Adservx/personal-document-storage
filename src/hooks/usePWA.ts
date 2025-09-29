import { useEffect, useState } from 'react';

interface PWAStatus {
  isSupported: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

const usePWA = (): PWAStatus => {
  const [pwaStatus, setPWAStatus] = useState<PWAStatus>({
    isSupported: false,
    isInstalled: false,
    isStandalone: false,
    swRegistration: null,
    updateAvailable: false
  });

  useEffect(() => {
    // Check if PWA is supported
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    // Check if app is running in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    // Check if app was previously installed (even if browsing in regular browser now)
    const wasInstalled = localStorage.getItem('pwa-was-installed') === 'true';
    const isInstalled = isStandalone || wasInstalled;

    setPWAStatus(prev => ({
      ...prev,
      isSupported,
      isInstalled,
      isStandalone
    }));

    if (isSupported) {
      // Only register service worker in production or when explicitly needed
      const shouldRegisterSW = process.env.NODE_ENV === 'production' || 
                               localStorage.getItem('enable-sw-dev') === 'true';
      
      if (shouldRegisterSW) {
        registerServiceWorker();
      } else {
        console.log('PWA: Service Worker registration skipped in development');
      }
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      // Clear any existing service worker registrations to avoid conflicts
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of existingRegistrations) {
        if (registration.scope.includes(window.location.origin)) {
          console.log('PWA: Unregistering existing service worker');
          await registration.unregister();
        }
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('PWA: Service Worker registered successfully:', registration);

      setPWAStatus(prev => ({
        ...prev,
        swRegistration: registration
      }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('PWA: New content is available; please refresh.');
              setPWAStatus(prev => ({
                ...prev,
                updateAvailable: true
              }));
              
              // Optionally auto-update after a delay
              setTimeout(() => {
                if (newWorker.state === 'installed') {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              }, 5000);
            }
          });
        }
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          window.location.reload();
        }
      });

      // Update service worker on page load if new one is waiting
      if (registration.waiting) {
        setPWAStatus(prev => ({
          ...prev,
          updateAvailable: true
        }));
      }

      // Periodically check for updates
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
      
      // In development mode, this is often expected and not critical
      if (window.location.hostname === 'localhost') {
        console.info('PWA: Service Worker registration failed in development - this is often normal');
      }
      
      // Still set the PWA as supported even if SW registration fails
      setPWAStatus(prev => ({
        ...prev,
        isSupported: true // PWA features can still work without SW
      }));
    }
  };

  return pwaStatus;
};

export default usePWA;
