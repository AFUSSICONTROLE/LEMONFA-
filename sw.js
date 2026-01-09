const CACHE_NAME = 'lemonfa-v1';
// Liste des fichiers à mettre en cache pour le mode hors-ligne
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './votre-photo.png',
  './amazone.jpg'
];

// 1. Installation : On télécharge les fichiers dans le cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Système Lemonfa : Mise en cache des actifs');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Force la mise à jour immédiate
});

// 2. Activation : On nettoie les anciens caches pour éviter les bugs
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Système Lemonfa : Nettoyage ancien cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Stratégie réseau : On sert le cache, sinon on va sur internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
