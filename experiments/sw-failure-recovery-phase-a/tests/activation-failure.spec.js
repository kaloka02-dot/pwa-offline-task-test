import {test,expect} from '@playwright/test';

test('activation fault is executed after prior client closes and old cache remains',async({page,request,context})=>{
 await request.post('/__test/mode',{data:'good'});
 await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 expect(await page.evaluate(async()=>!!(await caches.match('./index.html')))).toBe(true);
 try{
  await request.post('/__test/mode',{data:'bad-activate'});
  const fetchBefore=Number(await (await request.get('/__test/bad-fetch-count')).text());
  const activateBefore=Number(await (await request.get('/__test/activation-count')).text());
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();try{await r.update()}catch{}});
  await page.close();
  await expect.poll(async()=>Number(await (await request.get('/__test/activation-count')).text()),{timeout:10000}).toBeGreaterThan(activateBefore);
  const fetched=Number(await (await request.get('/__test/bad-fetch-count')).text());
  expect(fetched).toBeGreaterThan(fetchBefore);
  const fresh=await context.newPage();
  await fresh.goto('/');
  await expect(fresh.locator('#release')).toHaveText('Release 1');
  const keys=await fresh.evaluate(()=>caches.keys());
  expect(keys).toContain('sw-phase-a-good-1');
  const diagnostic=await fresh.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();return {activeState:reg?.active?.state,activeScript:reg?.active?.scriptURL,waitingState:reg?.waiting?.state,controller:!!navigator.serviceWorker.controller,cacheKeys:await caches.keys(),shell:!!(await caches.match('./index.html'))}});
  console.log('PHASE_B_DIAGNOSTIC',JSON.stringify(diagnostic));
  await context.setOffline(true);
  try{
   await fresh.reload();
   await expect(fresh.locator('#release')).toHaveText('Release 1');
  }finally{await context.setOffline(false)}
 }finally{await request.post('/__test/mode',{data:'good'})}
});
