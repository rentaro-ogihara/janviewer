// 画面などはキャッシュを優先、商品データ（data.json）は通信できればいつも最新を取りにいく
const CACHE = "jan-viewer-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./data.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("/data.json")) {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./data.json", copy)); return r; })
        .catch(() => caches.match("./data.json"))
    );
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
