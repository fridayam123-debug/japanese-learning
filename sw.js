const CACHE = 'jp-learn-v17';
const FILES = [
  './japanese.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', e => {
  // 설치 시 모든 파일 캐시 → 오프라인 사용 가능
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
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
  // japanese.html: 캐시 우선 + 백그라운드 업데이트 (stale-while-revalidate)
  // 오프라인에서도 캐시본으로 동작, 온라인이면 최신 버전으로 캐시 갱신
  if (e.request.url.includes('japanese.html')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const update = fetch(e.request)
            .then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; })
            .catch(() => null);
          return cached || update;
        })
      )
    );
    return;
  }
  // 나머지: 캐시 우선
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request))
  );
});
