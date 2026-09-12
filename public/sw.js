// ═════════════════════════════════════════════════════════
// FILMX SERVICE WORKER — ULTRA-FAST CACHING & OFFLINE PWA
// ═════════════════════════════════════════════════════════

const CACHE_NAME = 'filmx-v3.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

// 1. Install: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache non-fatal error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate: Clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Allow clients to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 3. Fetch strategy: Smart routing based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http requests
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // CRITICAL: Completely bypass Service Worker for Next.js internal chunks & HMR
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('/_next/') ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // CRITICAL: Next.js App Router RSC payload & prefetch requests must never be intercepted or faked as 408
  const isRSC =
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-State-Tree') ||
    request.headers.get('Next-Url') ||
    url.searchParams.has('_rsc');

  if (isRSC) {
    // Let browser handle native network request
    return;
  }

  // A. Static Image Assets: Cache-First with fallback
  if (
    request.destination === 'image' ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone()).catch(() => {});
              }
              return networkResponse;
            })
            .catch(() => {
              return cache.match('/icons/icon-192x192.png');
            });
        });
      })
    );
    return;
  }

  // B. Search API: Stale-While-Revalidate
  if (url.pathname === '/api/search') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone()).catch(() => {});
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // C. HTML Pages: Network-First with Cache fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone).catch(() => {});
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Internet aloqasi yo\'q. Iltimos tarmoqni tekshiring.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // D. Other Assets (CSS, JS, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (cachedResponse) return cachedResponse;
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });

      return cachedResponse || fetchPromise;
    })
  );
});
