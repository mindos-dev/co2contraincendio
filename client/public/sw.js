// OPERIS Service Worker — CO2 Contra Incêndio
// Estratégia: Cache First para assets estáticos, Network First para API

const CACHE_NAME = "operis-v1";
const OFFLINE_URL = "/app/dashboard";

// Assets que serão pré-cacheados na instalação
const PRECACHE_ASSETS = [
  "/",
  "/app/dashboard",
  "/app/login",
  "/manifest.json",
];

// Instalar: pré-cachear assets essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pré-cache parcialmente falhou:", err);
      });
    })
  );
  self.skipWaiting();
});

// Ativar: limpar caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: estratégia híbrida
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET e APIs externas
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // API tRPC — sempre Network First (dados em tempo real)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        // Offline: retornar resposta de erro amigável para API
        return new Response(
          JSON.stringify({ error: { message: "Sem conexão. Verifique sua internet." } }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // Assets estáticos (JS, CSS, imagens) — Cache First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // Navegação (HTML) — Network First com fallback para cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL) || new Response(
              "<html><body><h1>OPERIS — Sem conexão</h1><p>Verifique sua internet e tente novamente.</p></body></html>",
              { headers: { "Content-Type": "text/html" } }
            );
          });
        })
    );
    return;
  }
});
