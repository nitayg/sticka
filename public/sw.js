
const CACHE_NAME = 'sticker-swapper-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// התקנת service worker ושמירת המשאבים בקאש
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Try to cache items individually to prevent failing if one resource is unavailable
        const cachePromises = urlsToCache.map(url => 
          cache.add(url).catch(error => {
            console.error(`Failed to cache: ${url}`, error);
            // Continue caching other resources even if one fails
            return Promise.resolve();
          })
        );
        return Promise.all(cachePromises);
      })
      .catch(error => {
        console.error('Failed to set up cache:', error);
        // Service worker should still install even if caching fails
        return Promise.resolve();
      })
  );
});

// אסטרטגיית הפעלה - נסה תחילה מהרשת, אם אין תקשורת תשתמש בקאש
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            return response || Promise.reject('No match in cache and network failed');
          })
          .catch(error => {
            console.error('Fetch handler failed:', error);
            // Return a basic response as fallback
            return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
          });
      })
  );
});

// ניקוי קאש ישן כאשר יש גרסה חדשה
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
    .catch(error => {
      console.error('Cache cleanup failed:', error);
      return Promise.resolve();
    })
  );
});

// Handle errors gracefully
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.message);
});

// Catch unhandled rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in Service Worker:', event.reason);
});
