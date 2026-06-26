const CACHE = "ibig-partners-v2";

const STATIC = [
  "/",
  "/connexion",
  "/offline",
  "/icon.svg",
  "/icon-192.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes non HTTP, les API routes et les Server Actions
  if (!url.protocol.startsWith("http")) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    // Ressources Next.js statiques : cache-first
    if (url.pathname.includes("/_next/static/")) {
      e.respondWith(
        caches.match(request).then((cached) => cached || fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        }))
      );
    }
    return;
  }

  // Pages : network-first avec fallback hors-ligne
  e.respondWith(
    fetch(request)
      .then((res) => {
        // Mettre en cache les réponses GET réussies
        if (request.method === "GET" && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) =>
          cached || caches.match("/offline")
        )
      )
  );
});
