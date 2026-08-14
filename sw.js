const CACHE="fitplan-v17";
const ASSETS=["./","./index.html","./style.css","./app.js","./manifest.json","./icon.svg","./apple-touch-icon.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return res}).catch(()=>caches.match("./index.html"))));
self.addEventListener("push",e=>{let d={title:"FitPlan Pro",body:"Yeni sağlık görevin hazır.",url:"./"};try{Object.assign(d,e.data?.json()||{})}catch(_){}e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:"./icon.svg",badge:"./icon.svg",tag:"fitplan",data:{url:d.url}}))});
self.addEventListener("notificationclick",e=>{e.notification.close();const u=e.notification.data?.url||"./";e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>cs.length?cs[0].focus():clients.openWindow(u)))});
