const CACHE = 'anam-pages-v4';
const ASSETS = ['./index.html','./style.css','./app.js','./reference.js','./planning.js','./business.js','./resources.js','./sales.js','./operations.js','./management.js','./app.webmanifest','./icon.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url => new Request(url, {cache:'reload'}))).then(() => self.skipWaiting()))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('anam-pages-') || key === 'iwan-pages-v11') && key !== CACHE).map(key => caches.delete(key))).then(() => self.clients.claim()))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(result => result || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
