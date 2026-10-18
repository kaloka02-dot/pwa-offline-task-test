import {test,expect} from '@playwright/test';
test('V3-shaped backup validation rejects invalid and duplicate records',async({page})=>{
 await page.goto('/');
 const results=await page.evaluate(()=>{
 const valid=r=>r&&typeof r==='object'&&!Array.isArray(r)&&typeof r.id==='string'&&r.id.length>0&&r.id.length<=100&&typeof r.text==='string'&&r.text.length<=200&&typeof r.createdAt==='string'&&r.createdAt.length<=100;
 const check=x=>{if(!x||x.format!=='offline-records-lab'||x.version!==1||!Array.isArray(x.records)||x.records.length>10000||x.records.some(r=>!valid(r)))throw Error('Invalid');if(new Set(x.records.map(r=>r.id)).size!==x.records.length)throw Error('Duplicate');return true};
 const record={id:'a',text:'Keep',createdAt:'2026-10-17'},good={format:'offline-records-lab',version:1,records:[record]};
 return [good,{...good,version:2},{...good,records:[record,record]},{...good,records:[{...record,text:'x'.repeat(201)}]}].map(x=>{try{return check(x)}catch{return false}});
 });
 expect(results).toEqual([true,false,false,false]);
});
test('aborted backup import rolls back all changes',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
 const name='phase-c-disposable-backup-db';
 const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(name,1);r.onupgradeneeded=()=>r.result.createObjectStore('records',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
 const db=await open();
 const txrun=fn=>new Promise((resolve,reject)=>{const tx=db.transaction('records','readwrite');fn(tx.objectStore('records'),tx);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('Aborted'))});
 await txrun(s=>s.put({id:'original',text:'Keep'}));
 let aborted=false;
 try{await txrun((s,tx)=>{s.put({id:'new',text:'No'});s.put({id:'original',text:'Changed'});tx.abort()})}catch{aborted=true}
 const rows=await new Promise((resolve,reject)=>{const r=db.transaction('records').objectStore('records').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
 db.close();return {aborted,rows};
 });
 expect(result).toEqual({aborted:true,rows:[{id:'original',text:'Keep'}]});
});
