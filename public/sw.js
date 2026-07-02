const CACHE_NAME = "mycanvaslab-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg"
];

// Install Event: Pre-cache static shell resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static app shell");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clear stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Serve from cache, fallback to network, with Stale-While-Revalidate
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip API calls, web socket requests, or server-side terminal endpoints
  if (url.pathname.startsWith("/api") || request.url.includes("ws://") || request.url.includes("wss://")) {
    return;
  }

  // Skip hot module reloading files or development requests
  if (url.pathname.includes("@vite") || url.pathname.includes("@id") || url.pathname.includes("node_modules")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve cached version immediately, but fetch fresh content in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {
            // Silently ignore background fetch failure when offline
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and add to cache
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          // Don't cache POST requests or external API calls
          if (request.method !== "GET") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is page navigation, return cached index.html
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
