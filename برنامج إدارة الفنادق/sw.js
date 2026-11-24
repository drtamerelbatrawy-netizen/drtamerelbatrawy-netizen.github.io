const CACHE = 'iwan-pages-v11';
const ASSETS = ['./index.html','./style.css','./app.js','./reference.js','./planning.js','./business.js','./resources.js','./sales.js','./operations.js','./management.js','./app.webmanifest','./icon.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('iwan-') && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(result => result || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
