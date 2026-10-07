// v2 — ne jamais mettre en cache les pages HTML dynamiques/authentifiées
const CACHE = "ibig-v2";
const OFFLINE_PAGE = "/offline";

// Précharge uniquement la page offline (pas /espace qui est dynamique et authentifiée)
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.add(OFFLINE_PAGE)).then(() => self.skipWaiting())
  );
});

// Supprime les anciens caches (y compris ibig-v1 qui avait mis /espace en cache)
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Ne jamais mettre en cache :
  // - les pages HTML (navigation, /espace/*, /api/*, pages SSR)
  // - les requêtes cross-origin
  const isNavigation = e.request.mode === "navigate";
  const isDynamic = url.pathname.startsWith("/api/") || url.pathname.startsWith("/espace");
  const isCrossOrigin = url.origin !== self.location.origin;

  if (isNavigation || isDynamic || isCrossOrigin) {
    // Toujours chercher le réseau frais pour les pages et API
    e.respondWith(
      fetch(e.request).catch(() => {
        if (isNavigation) return caches.match(OFFLINE_PAGE);
        return new Response("", { status: 503 });
      })
    );
    return;
  }

  // Pour les assets statiques (_next/static/**, images, fonts…) : cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => new Response("", { status: 503 }));
    })
  );
});
