/* Field-pack service worker. Caches only explicit packs, their pages, and covers.
   Basemap tiles are not promised offline. Cache name must match src/lib/geo/offline.ts. */
const CACHE = "shanshizhi-field-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("shanshizhi-field-") && k !== CACHE)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  const packable =
    path.startsWith("/__pack/") ||
    path.startsWith("/covers/") ||
    path === "/offline" ||
    path.startsWith("/sites/") ||
    path.startsWith("/routes/") ||
    path.startsWith("/card/") ||
    path.startsWith("/gssp/");
  if (!packable) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(event.request);
      if (hit) return hit;
      try {
        const res = await fetch(event.request);
        return res;
      } catch {
        return new Response("Offline pack missing", { status: 503, statusText: "Offline" });
      }
    }),
  );
});
