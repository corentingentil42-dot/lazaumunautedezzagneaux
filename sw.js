/* sw.js — « service worker » volontairement VIDE : il ne met rien en cache (le jeu reste toujours à jour).
   Il sert uniquement à rendre le jeu installable (« Installer l'application » dans Chrome) pour le lancer en plein écran. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});   // on laisse passer toutes les requêtes telles quelles
