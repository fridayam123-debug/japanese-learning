const CACHE = 'jp-learn-v15';
const STATIC = ['./manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({ includeUncontrolled: true, type: 'window' }))
      .then(clients => Promise.all(clients.map(c => c.navigate(c.url))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // japanese.html: 항상 네트워크, 캐시 우회
  if (e.request.url.includes('japanese.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(r => {
          if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});
