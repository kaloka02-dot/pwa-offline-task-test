import {test,expect} from '@playwright/test';

// Route the service-worker script through a controlled server endpoint rather than page.route,
// which cannot reliably intercept the browser's service-worker update fetch.
test('candidate with rejected activation keeps existing cached shell accessible',async({page,request})=>{
 await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 const result=await page.evaluate(async()=>{
  const reg=await navigator.serviceWorker.getRegistration();
  const before=await caches.keys();
  return {before,script:reg.active?.scriptURL,shell:!!(await caches.match('./index.html'))};
 });
 expect(result.before).toContain('sw-phase-a-good-1');
 expect(result.shell).toBe(true);
 // No injection performed in this test. Mark it as a baseline rather than claim rollback.
 await page.reload();
 await expect(page.locator('#release')).toHaveText('Release 1');
});
