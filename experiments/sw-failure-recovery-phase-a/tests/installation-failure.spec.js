import {test,expect} from '@playwright/test';

async function setup(page,request){
 await request.post('/__test/mode',{data:'good'});
 await page.goto('/');
 await page.evaluate(()=>navigator.serviceWorker.ready);
 expect(await page.evaluate(async()=>!!(await caches.match('./index.html')))).toBe(true);
}
async function assertOriginalOffline(page,request){
 const state=await page.evaluate(async()=>{
  const r=await navigator.serviceWorker.getRegistration();
  return {active:!!r?.active,keys:await caches.keys(),shell:!!(await caches.match('./index.html'))};
 });
 expect(state.active).toBe(true);
 expect(state.keys).toContain('sw-phase-a-good-1');
 expect(state.shell).toBe(true);
 await page.context().setOffline(true);
 try{
  await page.reload();
  await expect(page.locator('#release')).toHaveText('Release 1');
 }finally{await page.context().setOffline(false)}
}
test('injected failed install preserves original offline shell',async({page,request})=>{
 await setup(page,request);
 try{
  const prior=Number(await (await request.get('/__test/bad-fetch-count')).text());
  await request.post('/__test/mode',{data:'bad-install'});
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();try{await r.update()}catch{}});
  await expect.poll(async()=>Number(await (await request.get('/__test/bad-fetch-count')).text())).toBeGreaterThan(prior);
  await assertOriginalOffline(page,request);
 }finally{await request.post('/__test/mode',{data:'good'})}
});
test('injected script retrieval failure preserves original offline shell',async({page,request})=>{
 await setup(page,request);
 try{
  const prior=Number(await (await request.get('/__test/bad-fetch-count')).text());
  await request.post('/__test/mode',{data:'bad-script'});
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();try{await r.update()}catch{}});
  await expect.poll(async()=>Number(await (await request.get('/__test/bad-fetch-count')).text())).toBeGreaterThan(prior);
  await assertOriginalOffline(page,request);
 }finally{await request.post('/__test/mode',{data:'good'})}
});
