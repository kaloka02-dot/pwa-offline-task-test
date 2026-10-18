const CACHE='sw-phase-a-good-1';const ASSETS=['./index.html','./app.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method==='GET'&&u.origin===location.origin&&u.pathname.startsWith(new URL(self.registration.scope).pathname))event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)))});
