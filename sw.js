const VERSION = "artefacts-index-v1";
const COQUILLE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icone-192.png",
  "./icone-512.png",
  "./icone-maskable.png",
  "./apple-touch-icon.png",
  "./doomsday/icone-192.png",
  "./undercover/icone-192.png",
  "./affectation/icone-192.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request)
          .then((rep) => {
            const copie = rep.clone();
            caches.open(VERSION).then((c) => c.put(e.request, copie));
            return rep;
          })
          .catch(() => (e.request.mode === "navigate" ? caches.match("./index.html") : Response.error()))
    )
  );
});
