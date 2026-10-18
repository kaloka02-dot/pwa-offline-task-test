const CACHE='offline-records-v3-shell-2';
const ASSETS=['./','./index.html','./app.js','./manifest.webmanifest','./icon.svg'];
const SCOPE=new URL(self.registration.scope);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('offline-records-v3-shell-')&&key!==CACHE)
      .map(key=>caches.delete(key))
  )));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
