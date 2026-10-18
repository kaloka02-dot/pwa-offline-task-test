import {test,expect} from '@playwright/test';

const NAME='phase-b-disposable-db';
async function reset(page){await page.goto('/');await page.evaluate(async name=>{const existing=await indexedDB.databases();if(existing.some(db=>db.name===name))await new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase(name);r.onsuccess=resolve;r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Unexpected blocked cleanup'))})},NAME)}

test('aborted schema upgrade rolls back schema and preserves committed records',async({page})=>{
 await reset(page);
 const outcome=await page.evaluate(async name=>{
  const open=(version,upgrade)=>new Promise((resolve,reject)=>{const r=indexedDB.open(name,version);r.onupgradeneeded=()=>upgrade?.(r.result,r.transaction);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const db=await open(1,d=>d.createObjectStore('records',{keyPath:'id'}));
  await new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put({id:'keep',text:'Must survive'});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();
  let upgradeFailed=false;
  try{await open(2,(d,tx)=>{d.createObjectStore('temporary');tx.abort()})}catch{upgradeFailed=true}
  const recovered=await open(1);
  const rows=await new Promise((resolve,reject)=>{const r=recovered.transaction('records').objectStore('records').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const result={upgradeFailed,version:recovered.version,hasTemporary:recovered.objectStoreNames.contains('temporary'),rows};recovered.close();return result;
 },NAME);
 expect(outcome.upgradeFailed).toBe(true);
 expect(outcome.version).toBe(1);
 expect(outcome.hasTemporary).toBe(false);
 expect(outcome.rows).toEqual([{id:'keep',text:'Must survive'}]);
});

test('older app cannot silently downgrade newer database; stored records remain intact',async({page})=>{
 await reset(page);
 const result=await page.evaluate(async name=>{
  const open=version=>new Promise((resolve,reject)=>{const r=indexedDB.open(name,version);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('records'))r.result.createObjectStore('records',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const db=await open(2);
  await new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');tx.objectStore('records').put({id:'preserve',text:'Newer data'});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();
  let errorName=null;try{const old=await open(1);old.close()}catch(e){errorName=e.name}
  const reopened=await open(2);
  const record=await new Promise((resolve,reject)=>{const r=reopened.transaction('records').objectStore('records').get('preserve');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const version=reopened.version;reopened.close();return {errorName,version,record};
 },NAME);
 expect(result.errorName).toBe('VersionError');
 expect(result.version).toBe(2);
 expect(result.record).toEqual({id:'preserve',text:'Newer data'});
});
