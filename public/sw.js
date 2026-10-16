const CACHE_NAME = 'ats-analyzer-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/apple-touch-icon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Opened cache:', CACHE_NAME);
        return Promise.allSettled(
          urlsToCache.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[ServiceWorker] Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Installation complete');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Never intercept cross-origin model/CDN downloads (Hugging Face, WASM, etc.).
  // Fetching them from the SW strips CORS and is what blocked AI init in production.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Model proxy must hit the Worker, not the SW cache.
  if (url.pathname.startsWith('/models-proxy/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then(response => response || fetch(request))
  );
});
