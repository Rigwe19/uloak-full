self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
self.addEventListener('fetch', (e) => {
  // Network-first for share pages, cache-first for assets
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/share/')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
});
