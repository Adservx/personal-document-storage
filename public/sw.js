const CACHE_NAME = 'securedoc-v1.0.0';
const RUNTIME_CACHE = 'securedoc-runtime';

// Detect environment
const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Assets to cache immediately (development-friendly)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/logo.svg'
  // Note: CSS and JS bundles are dynamically generated in development
  // They will be cached on-demand via the fetch event handler
];

// Install event - cache essential resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Precaching resources');
        // Cache resources individually to avoid single failure breaking everything
        return Promise.allSettled(
          PRECACHE_URLS.map(url => 
            fetch(new Request(url, { credentials: 'same-origin' }))
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                } else {
                  console.warn(`SW: Failed to cache ${url}: ${response.status}`);
                }
              })
              .catch(error => {
                console.warn(`SW: Failed to fetch ${url}:`, error);
              })
          )
        );
      })
      .then(() => {
        console.log('SW: Precaching completed, skip waiting');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Precaching failed:', error);
        // Still skip waiting to allow SW to activate
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map(cacheName => {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('SW: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Skip Supabase API calls (always fetch fresh)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
    return;
  }

  // Skip Firebase API calls (always fetch fresh)
  if (url.hostname.includes('firebase.com') || url.hostname.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) {
        // For HTML files, try to update cache in background
        if (request.headers.get('accept')?.includes('text/html')) {
          event.waitUntil(updateCache(request));
        }
        return cachedResponse;
      }

      // Network first for API calls and dynamic content
      return fetch(request).then(response => {
        // Only cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          
          // Cache static assets and pages
          if (shouldCache(request)) {
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
        }
        
        return response;
      }).catch(error => {
        console.error('SW: Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
        
        throw error;
      });
    })
  );
});

// Helper function to update cache in background
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response);
    }
  } catch (error) {
    console.log('SW: Background cache update failed:', error);
  }
}

// Helper function to determine if request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)$/)) {
    return true;
  }
  
  // Cache HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    return true;
  }
  
  // Cache fonts
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return true;
  }
  
  return false;
}

// Handle background sync for offline uploads
self.addEventListener('sync', event => {
  if (event.tag === 'background-upload') {
    event.waitUntil(handleBackgroundUpload());
  }
});

async function handleBackgroundUpload() {
  console.log('SW: Handling background upload sync');
  // This could be extended to handle offline uploads when connection is restored
}

// Handle push notifications (future feature)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'securedoc-notification',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View Document'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle skip waiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('SW: Service Worker loaded');
