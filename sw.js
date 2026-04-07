const CACHE_NAME = 'lix-v4';

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

// Cache-first for same-origin, network-first for others
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return cached;
      });
    })
  );
});
