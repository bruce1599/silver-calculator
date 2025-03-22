const CACHE_NAME = 'silver-calculator-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './script.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Enhanced Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Controlled Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Strategic Fetch Handling
self.addEventListener('fetch', (event) => {
  // Cache-First with Network Fallback Strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Clone request for network fallback
        return fetch(event.request)
          .then(networkResponse => {
            // Cache new resources dynamically
            if (event.request.method === 'GET' && 
                !networkResponse.url.includes('chrome-extension')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback for failed requests
            if (event.request.destination === 'document') {
              return caches.match('./offline.html');
            }
            return new Response('Offline content unavailable', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background Sync Handler (Optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncData') {
    event.waitUntil(handleBackgroundSync());
  }
});
