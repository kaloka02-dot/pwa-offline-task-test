import {test,expect} from '@playwright/test';
test('failed candidate install does not replace active worker or remove working cached shell',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 const initial=await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return {script:r.active.scriptURL,keys:await caches.keys()}});
 expect(initial.keys).toContain('sw-phase-a-good-1');
 const failedSource=`const CACHE='sw-phase-a-broken-2';self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./missing-phase-a-asset-404.js']))));`;
 await page.route('**/sw.js',route=>route.fulfill({status:200,contentType:'application/javascript',headers:{'cache-control':'no-store'},body:failedSource}));
 const outcome=await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();try{await reg.update()}catch{}await new Promise(resolve=>setTimeout(resolve,1200));return {active:!!reg.active,activeScript:reg.active?.scriptURL,waiting:!!reg.waiting,keys:await caches.keys(),shell:!!(await caches.match('./index.html'))}});
 expect(outcome.active).toBe(true);
 expect(outcome.waiting).toBe(false);
 expect(outcome.shell).toBe(true);
 expect(outcome.keys).toContain('sw-phase-a-good-1');
 await page.reload();await expect(page.locator('#release')).toHaveText('Release 1');
});
test('network failure during candidate script retrieval leaves prior release available',async({page})=>{
 await page.goto('/');await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.route('**/sw.js',route=>route.abort('failed'));
 await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();try{await r.update()}catch{}});
 const status=await page.evaluate(async()=>({active:!!(await navigator.serviceWorker.getRegistration()).active,shell:!!(await caches.match('./index.html'))}));
 expect(status.active).toBe(true);expect(status.shell).toBe(true);
});
