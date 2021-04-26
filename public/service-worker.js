var CACHE_NAME = 'my-site-cache-v1';

var urlsToCache = [
  '/',
  '/styles.css',
  '/index.js',
  '/db.js',
  '/manifest.json',
  '/service-worker.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  console.info('Event: Install');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", function(evt) {
  console.info('Event: Activate');
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  console.log('[Service Worker] Fetching resource: ' + event.request.url);
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/index.html");
        }
      });
    })
  );
});