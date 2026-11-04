// Offline-Unterstützung: immer erst beim Server nachfragen (damit Updates sofort ankommen),
// nur ohne Internet aus dem Cache.
// Version kommt aus app.js (sw.js?v=…); neue Version = neuer Cache.
const CACHE = 'vokabeln-' + (new URL(location.href).searchParams.get('v') || 'dev');
const ASSETS = ['./', 'index.html', 'style.css', 'app.js', 'vocab.js', 'stickers.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  // cache: 'reload' umgeht den Browser-Cache (GitHub Pages erlaubt sonst 10 Minuten alte Dateien)
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// GitHub Pages schickt "max-age=600": der Browser würde Skripte dann bis zu 10 Minuten
// aus dem Arbeitsspeicher nehmen, ohne nachzufragen. Darum als "immer nachprüfen" markieren.
function fresh(res) {
  if (!res || res.type === 'opaque' || res.type === 'opaqueredirect') return res;
  const h = new Headers(res.headers);
  h.set('Cache-Control', 'no-cache');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    // cache: 'no-cache' = beim Server prüfen, ob es eine neuere Datei gibt (kostet kaum Daten)
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return fresh(res); })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => fresh(r) || caches.match('./')))
  );
});
