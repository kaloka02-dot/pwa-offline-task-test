import {test,expect} from '@playwright/test';

test('controlled activation fault is delivered and existing offline shell remains readable',async({page,request})=>{
 await request.post('/__test/mode',{data:'good'});
 await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 const before=await page.evaluate(async()=>({keys:await caches.keys(),shell:!!(await caches.match('./index.html'))}));
 expect(before.keys).toContain('sw-phase-a-good-1');
 try{
  await request.post('/__test/mode',{data:'bad-activate'});
  const prior=Number(await (await request.get('/__test/bad-fetch-count')).text());
  const activationPrior=Number(await (await request.get('/__test/activation-count')).text());
  const outcome=await page.evaluate(async()=>{
   const reg=await navigator.serviceWorker.getRegistration();
   try{await reg.update()}catch{}
   await new Promise(resolve=>setTimeout(resolve,750));
   return {active:!!reg.active,keys:await caches.keys(),shell:!!(await caches.match('./index.html'))};
  });
  const observed=Number(await (await request.get('/__test/bad-fetch-count')).text());
  expect(observed,'Browser must actually fetch injected worker script').toBeGreaterThan(prior);
  const activationObserved=Number(await (await request.get('/__test/activation-count')).text());
  expect(activationObserved,'Browser must execute injected activation handler').toBeGreaterThan(activationPrior);
  expect(outcome.shell).toBe(true);
  expect(outcome.keys).toContain('sw-phase-a-good-1');
  expect(outcome.active).toBe(true);
 }finally{await request.post('/__test/mode',{data:'good'})}
});
