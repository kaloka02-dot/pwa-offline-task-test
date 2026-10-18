import {test,expect} from '@playwright/test';

// Deliberately verifies that the failure-injection route was exercised.
// A green test without observing the injected failure is not evidence of rollback.
test('failed activation must not silently count as successful rollback',async({page})=>{
 await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 let injected=0;
 const candidate=`const CACHE='sw-phase-b-candidate-2';self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./index.html']))));self.addEventListener('activate',e=>e.waitUntil(Promise.reject(Error('injected activation failure'))));`;
 await page.route('**/sw.js',route=>{injected++;return route.fulfill({status:200,contentType:'application/javascript',headers:{'cache-control':'no-store'},body:candidate})});
 await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();try{await r.update()}catch{}});
 expect(injected,'Service-worker update interception must be observed; otherwise this test proves nothing').toBeGreaterThan(0);
 await expect(page.locator('#release')).toHaveText('Release 1');
 const state=await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return {active:!!r.active,shell:!!(await caches.match('./index.html'))}});
 expect(state.active).toBe(true);
 expect(state.shell).toBe(true);
});
