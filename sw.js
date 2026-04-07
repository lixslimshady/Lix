const CACHE_NAME = 'lix-v6';

// Cache the app shell on install
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/Lix/',
        '/Lix/index.html',
        '/Lix/manifest.json',
        '/Lix/icon-192.png',
        '/Lix/icon-512.png'
      ]).catch(function(err) {
        console.log('Cache addAll error (non-fatal):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // Remove old caches
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Network-first: always try network, fall back to cache when offline
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Network failed — serve from cache if available
      return caches.match(e.request);
    })
  );
});
