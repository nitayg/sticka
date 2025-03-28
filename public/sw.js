
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
  );
});

// אסטרטגיית הפעלה - נסה תחילה מהרשת, אם אין תקשורת תשתמש בקאש
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
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
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Handle errors gracefully
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.message);
});
