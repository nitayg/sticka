
const CACHE_NAME = 'sticker-swapper-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/b23851f0-cce1-44f8-a175-8ac64b6c3e4a.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// התקנת service worker ושמירת המשאבים בקאש
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache resources:', error);
          // Continue with installation even if some resources fail to cache
          return Promise.resolve();
        });
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
