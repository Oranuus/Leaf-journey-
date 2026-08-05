 const CACHE_NAME = 'leaf-journey-cache-v5';
const STATIC_ASSETS = [
  './',
  './leaf_journey.html',
  './style.css?v=3',
  './environments.js?v=4',
  './game.js?v=3',
  './manifest.json',
  './orange leaf.png',
  './green leaf.png',
  './bg1.png',
  './day.png',
  './night.png',
  './spring.png',
  './cloud1.png',
  './cloud2.png',
  './cloud3.png',
  './cloud4.png',
  './raindrop.png',
  './petal.png',
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

// تثبيت الكاش والمسح التلقائي للقديم
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // حذف الكاش القديم فوراً
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

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
