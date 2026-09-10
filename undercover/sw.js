const VERSION = "undercover-v14";
const COQUILLE = [
  "./",
  "./index.html",
  "./app-dba3117ec1.js",
  "./manifest.webmanifest",
  "./icone-192.png",
  "./icone-512.png",
  "./icone-maskable.png",
  "./apple-touch-icon.png"
];
const estImage = (u) => /\.(png|jpg|jpeg|svg|webp|woff2?)$/i.test(u.pathname);

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

const depuisReseau = (req) =>
  fetch(req)
    .then((rep) => {
      const copie = rep.clone();
      caches.open(VERSION).then((c) => c.put(req, copie));
      return rep;
    })
    .catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())));

const depuisCache = (req) =>
  caches.match(req).then(
    (hit) =>
      hit ||
      fetch(req)
        .then((rep) => {
          const copie = rep.clone();
          caches.open(VERSION).then((c) => c.put(req, copie));
          return rep;
        })
        .catch(() => Response.error())
  );

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const externe = url.origin !== location.origin;
  if (externe && !/googleapis|gstatic/.test(url.hostname)) return;
  e.respondWith(externe || estImage(url) ? depuisCache(e.request) : depuisReseau(e.request));
});
