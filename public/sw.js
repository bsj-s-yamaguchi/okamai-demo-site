const CACHE_NAME = 'okamai-cache-v1';
const urlsToCache = [
  '/',
  '/api/config',
  'https://demo-site.local',
  'https://okamai-web.local',
  'https://client-console.local',
  'https://brave-console.local',
  'https://app-api.local',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
