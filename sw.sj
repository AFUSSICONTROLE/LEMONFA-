const CACHE_NAME = 'afussi-supreme-v3'; // Version v3 pour forcer le changement
const ASSETS = [
  './',
  './index.html',
  './brain.js',
  './manifest.json',
  './votre-photo.png'
];

// Installation : Mise en cache des nouveaux fichiers
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activation : Suppression de l'ancienne version (Sentinelle v10.9.5)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Récupération des fichiers (mode offline possible)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
