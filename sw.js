// 오프라인용: 네트워크 우선, 실패하면 캐시. 데이터 수정이 바로 반영되도록.
const CACHE = 'sh26-v16';
const ASSETS = ['./', 'index.html', 'styles.css', 'app.js', 'data.js', 'maps.js', 'img/map-day1.jpg', 'img/map-day2.jpg', 'img/map-day3.jpg', 'img/map-disney.jpg', 'gaode.html', 'favicon.png', 'mascot.png', 'manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return; // 날씨 API는 캐시하지 않음(앱에서 localStorage로 보관)
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
