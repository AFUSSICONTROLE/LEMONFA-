const cacheName = 'lemonfa-afussi-v1';
// Ajout de icon.png pour qu'il soit disponible hors-ligne
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Installation du Service Worker et mise en cache des fichiers
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Génie Béninois : Mise en cache des fichiers de justice...');
      return cache.addAll(assets);
    })
  );
});

// Stratégie de cache : Répondre avec le cache si dispo, sinon chercher sur le réseau
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
