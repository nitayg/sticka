
const CACHE_NAME = 'sticker-swapper-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
  // Removed possibly missing resources that could be causing failures
];

// Install service worker and cache resources with error handling
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use cache.add for individual resources with error handling
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache resource: ${url}`, error);
              // Continue despite the error
              return Promise.resolve();
            })
          )
        );
      })
  );
});

// Network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If resource is not in cache, return a basic offline response
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            // Return empty response for other resources
            return new Response('', { status: 408, statusText: 'Offline' });
          });
      })
  );
});

// Clean old caches when there's a new version
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
