// Service worker do MindSchool: deixa a app abrir sem ligação. Não guarda dados da API nem toca em pedidos de escrita:
// as notas e faltas sem ligação ficam numa fila no próprio dispositivo (src/lib/offline-queue.ts).
const VERSION = "v2";
const STATIC = `mindschool-static-${VERSION}`;
const PAGES = `mindschool-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const cacheable = (res) => res.ok && !res.redirected && !/no-store/i.test(res.headers.get("cache-control") || "");

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // nunca interceptar escritas
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // a API vive noutra origem: vai sempre à rede

  // Ficheiros da app (imutáveis, com hash no nome) e imagens: primeiro a cache.
  if (url.pathname.startsWith("/_next/static/") || /\.(?:png|svg|webp|jpg|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (cacheable(res)) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Páginas: rede primeiro; sem rede, a última cópia da mesma página e, na falta dela, o aviso sem ligação.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (cacheable(res)) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match(OFFLINE_URL))),
    );
  }
});
