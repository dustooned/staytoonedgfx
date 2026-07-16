const CACHE = 'stg-2026-07-16f';

const SHELL = [
  '/',
  '/index.html',
  '/reader.html',
  '/series.html',
  '/about.html',
  '/archive.html',
  '/404.html',
  '/css/style.css',
  '/js/app.js',
  '/js/drag-order.js',
  '/js/pwa-install.js',
  '/js/series.js',
  '/js/archive.js',
  '/js/hero-type.js',
  '/js/transition.js',
  '/js/wallpaper.js',
  '/js/cursor.js',
  '/js/construction.js',
  '/js/reader.js',
  '/manifest.json',
  '/assets/logo.svg',
  '/assets/favicon.ico',
  '/assets/apple-touch-icon.png',
  '/assets/android-chrome-192x192.png',
  '/assets/android-chrome-512x512.png',
];

// Pre-cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// Remove old caches on activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Comic images: cache-first, populate on first access
  if (/\.(jpe?g|png|gif|webp)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return resp;
        });
      })
    );
    return;
  }

  // manifest.json: network-first so new chapters always load, cache as fallback
  if (url.pathname.endsWith('manifest.json')) {
    e.respondWith(
      fetch(request)
        .then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // App shell: cache-first
  e.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
