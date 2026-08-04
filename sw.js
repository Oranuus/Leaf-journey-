const CACHE_NAME = 'leaf-journey-cache';
const STATIC_ASSETS = [
  './',
  './leaf_journey.html',
  './style.css',
  './environments.js',
  './game.js',
  './manifest.json',
  './orange leaf.png',
  './green leaf.png',
  './bg1.png',
  './night.png',
  './bird.png',
  './fork.png',
  './airship.png',
  './trade.png',
  './tornado.png',
  './net.png',
  './daily bubble.ttf',
  './menu_sound.js',
  './air_sound.js'
];

// تثبيت الكاش لأول مرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// استراتيجية التحديث التلقائي الذكية (Network First للأكواد)
self.addEventListener('fetch', (event) => {
  const reqUrl = new URL(event.request.url);

  if (reqUrl.pathname.endsWith('.html') || reqUrl.pathname.endsWith('.js') || reqUrl.pathname.endsWith('.css') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
  }
});
