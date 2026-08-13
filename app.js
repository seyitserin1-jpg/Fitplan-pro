const app=document.getElementById('app');
const KEY='fitplan_v11';
const LEGACY_KEY='fitplan_v10';
const OLDER_KEY='fitplan_v8';
const defaults={name:'',sex:'male',age:30,height:175,weight:92,target:78,activity:1.4,water:0,steps:0,sleep:0,calories:0,protein:0,mealsDone:[],weights:[],foods:[]};
const storedV6=JSON.parse(localStorage.getItem(KEY)||'null');
const storedLegacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
const storedOlder=JSON.parse(localStorage.getItem(OLDER_KEY)||'null');
let S=Object.assign({},defaults,storedV6||storedLegacy||storedOlder||{});
if(!storedV6) localStorage.setItem(KEY,JSON.stringify(S));
const cfg=window.FITPLAN_CONFIG||{};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));

// V9 live pedometer: uses the phone motion sensor while the page is open.
const stepTracker={running:false,listener:null,lastPeak:0,baseline:9.81,peak:false,threshold:1.35};
function updateStepUI(){
 const el=document.getElementById('liveSteps'); if(el) el.textContent=fmt(S.steps);
 const bar=document.getElementById('liveStepBar'); if(bar) bar.style.width=pct(S.steps,8000)+'%';
 const status=document.getElementById('stepStatus'); if(status) status.textContent=stepTracker.running?'Canlı sayım açık • telefonu yanında taşı':'Telefon sensörü hazır';
 const btn=document.getElementById('stepLiveBtn'); if(btn){btn.textContent=stepTracker.running?'Durdur':'Başlat';btn.classList.toggle('light',stepTracker.running)}
}
function handleMotion(e){
 const a=e.accelerationIncludingGravity; if(!a) return;
 const x=a.x||0,y=a.y||0,z=a.z||0;
 const mag=Math.sqrt(x*x+y*y+z*z);
 stepTracker.baseline=stepTracker.baseline*0.92+mag*0.08;
 const dynamic=mag-stepTracker.baseline, now=performance.now();
 if(dynamic>stepTracker.threshold && !stepTracker.peak && now-stepTracker.lastPeak>330){
   stepTracker.peak=true; stepTracker.lastPeak=now; S.steps+=1; save(); updateStepUI();
   if(S.steps%100===0) toast(`${fmt(S.steps)} adım oldu 🎉`);
 }
 if(dynamic<0.35) stepTracker.peak=false;
}
async function startLiveSteps(){
 if(stepTracker.running){stopLiveSteps();return}
 try{
   if(!('DeviceMotionEvent' in window)){toast('Bu tarayıcı canlı adım saymayı desteklemiyor.');return}
   if(typeof DeviceMotionEvent.requestPermission==='function'){
     const permission=await DeviceMotionEvent.requestPermission();
     if(permission!=='granted'){toast('Hareket sensörü izni verilmedi.');return}
   }
   stepTracker.lastPeak=0;stepTracker.peak=false;stepTracker.running=true;stepTracker.listener=handleMotion;
   window.addEventListener('devicemotion',stepTracker.listener,{passive:true}); updateStepUI(); toast('Canlı adım sayar başladı 🚶');
 }catch(err){stepTracker.running=false;toast('Hareket sensörüne erişilemedi.');updateStepUI()}
}
function stopLiveSteps(){
 if(stepTracker.listener) window.removeEventListener('devicemotion',stepTracker.listener);
 stepTracker.listener=null;stepTracker.running=false;updateStepUI();toast('Canlı adım sayar durduruldu');
}
window.addEventListener('pagehide',()=>{if(stepTracker.running)stopLiveSteps()});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const fmt=n=>Number(n||0).toLocaleString('tr-TR');
const pct=(a,b)=>Math.min(100,Math.max(0,b?100*a/b:0));
function bmr(){return S.sex==='male'?10*S.weight+6.25*S.height-5*S.age+5:10*S.weight+6.25*S.height-5*S.age-161}
function tdee(){return bmr()*S.activity}
function goalKcal(){return Math.max(S.sex==='male'?1500:1200,Math.round(tdee()-350))}
function proteinGoal(){return Math.round(S.target*1.6)}
function toast(t){const x=document.getElementById('toast');x.textContent=t;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),1800)}
function updateProfileMini(){const n=(S.name||'S').trim();document.getElementById('profileInitial').textContent=n[0]?.toUpperCase()||'S'}
function nav(page){
 document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
 ({home,plan,scan,profile}[page]||home)();
 window.scrollTo({top:0,behavior:'smooth'}); updateProfileMini();
}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>nav(b.dataset.page));

const mealData=[
 {id:'breakfast',time:'08:30',name:'Kahvaltı',icon:'○',foods:[['Yumurta','2 adet',156,13,1,11],['Yulaf','40 g',150,5,27,3],['Yoğurt','200 g',110,8,9,4],['Meyve','1 porsiyon',80,1,20,0]]},
 {id:'lunch',time:'13:00',name:'Öğle yemeği',icon:'◉',foods:[['Tavuk göğsü','150 g',248,46,0,5],['Bulgur','150 g',125,5,28,0],['Salata','1 büyük kase',70,3,10,2],['Ayran','250 ml',75,5,6,3]]},
 {id:'snack',time:'16:30',name:'Ara öğün',icon:'•',foods:[['Elma','1 orta',80,0,21,0],['Badem','15 g',87,3,3,7]]},
 {id:'dinner',time:'19:30',name:'Akşam yemeği',icon:'◇',foods:[['Mercimek yemeği','200 g',232,18,40,2],['Yoğurt','200 g',110,8,9,4],['Salata','1 büyük kase',70,3,10,2]]}
];
const events=[['07:30','01','Uyanış ve su'],['08:30','02','Kahvaltı'],['10:30','03','5–10 dk hareket'],['13:00','04','Öğle yemeği'],['15:30','05','Su molası'],['16:30','06','Ara öğün'],['18:30','07','20–30 dk yürüyüş'],['19:30','08','Akşam yemeği']];

let homeTab='overview';
function setHomeTab(tab){homeTab=tab;home()}
function home(){
 const k=goalKcal(),pg=proteinGoal(),calPct=pct(S.calories,k),waterPct=pct(S.water,8),proteinPct=pct(S.protein,pg),stepPct=pct(S.steps,8000);
 const score=Math.round((calPct+waterPct+proteinPct+stepPct)/4);
 const bars=[18,34,27,51,42,66,Math.max(8,score)], labels=['Pzt','Sal','Çar','Per','Cum','Cmt','Bug'];
 const tabs=[['overview','Genel','⌂'],['activity','Aktivite','◌'],['nutrition','Beslenme','◉'],['water','Su','≈']];
 let content='';
 if(homeTab==='overview') content=`
   <section class="os-compact-grid">
    <div class="os-mini-card accent-cyan"><span>👟 ADIM</span><b>${fmt(S.steps)}</b><small>/ 8.000</small><div class="mini-bar"><i style="width:${stepPct}%"></i></div></div>
    <div class="os-mini-card accent-pink"><span>🔥 ENERJİ</span><b>${fmt(S.calories)}</b><small>/ ${fmt(k)} kcal</small><div class="mini-bar"><i style="width:${calPct}%"></i></div></div>
    <div class="os-mini-card accent-blue"><span>💪 PROTEİN</span><b>${fmt(S.protein)}g</b><small>/ ${fmt(pg)}g</small><div class="mini-bar"><i style="width:${proteinPct}%"></i></div></div>
    <div class="os-mini-card accent-green"><span>💧 SU</span><b>${S.water}</b><small>/ 8 bardak</small><div class="mini-bar"><i style="width:${waterPct}%"></i></div></div>
   </section>
   <section class="os-ring-panel compact">
    <div class="os-panel-head"><div><span>AKTİVİTE HALKALARI</span><b>Bugünkü durum</b></div><strong>${score}%</strong></div>
    <div class="rings-layout compact-rings">
      <div class="activity-rings small-rings"><div class="ring ring-move" style="--p:${calPct}%"><div class="ring ring-exercise" style="--p:${stepPct}%"><div class="ring ring-stand" style="--p:${waterPct}%"><div class="ring-center"><strong>${fmt(S.steps)}</strong><small>ADIM</small></div></div></div></div></div>
      <div class="ring-legend compact-legend"><div><i class="legend-dot move"></i><span>Enerji</span><b>${Math.round(calPct)}%</b></div><div><i class="legend-dot exercise"></i><span>Hareket</span><b>${Math.round(stepPct)}%</b></div><div><i class="legend-dot stand"></i><span>Su</span><b>${Math.round(waterPct)}%</b></div></div>
    </div>
    <div class="watch-live-step compact-live"><div class="watch-step-left"><span class="step-symbol">⌁</span><div><b>Canlı adım sayacı</b><small id="stepStatus">${stepTracker.running?'Canlı sayım açık':'Sensör hazır'}</small></div></div><button id="stepLiveBtn" class="watch-toggle ${stepTracker.running?'on':''}" onclick="startLiveSteps()"><i></i>${stepTracker.running?'Durdur':'Başlat'}</button></div>
   </section>`;
 if(homeTab==='activity') content=`
   <section class="os-ring-panel compact"><div class="os-panel-head"><div><span>AKTİVİTE</span><b>Hareket merkeziniz</b></div><strong>${fmt(S.steps)}</strong></div><div class="activity-progress"><div class="activity-number"><b>${fmt(S.steps)}</b><span>/ 8.000 adım</span></div><div class="wide-progress"><i style="width:${stepPct}%"></i></div><div class="activity-foot"><span>${Math.round(stepPct)}% tamamlandı</span><button class="tiny-action" onclick="addSteps()">+500</button></div></div><div class="sensor-row"><span>●</span><div><b>Hareket sensörü</b><small id="stepStatus">${stepTracker.running?'Canlı sayım açık':'Hazır'}</small></div><button id="stepLiveBtn" class="watch-toggle ${stepTracker.running?'on':''}" onclick="startLiveSteps()"><i></i>${stepTracker.running?'Durdur':'Başlat'}</button></div></section>
   <section class="watch-chart-card compact-chart"><div class="watch-section-title"><div><span>HAFTALIK TREND</span><b>Adım ritmi</b></div><em>7 GÜN</em></div><div class="watch-chart">${bars.map((v,i)=>`<div class="watch-bar-col"><div class="watch-bar" style="height:${v}%"></div><small>${labels[i]}</small></div>`).join('')}</div></section>`;
 if(homeTab==='nutrition') content=`
   <section class="os-compact-list"><div class="os-list-head"><span>BESLENME</span><b>Bugünkü hedefler</b></div>${progress('Kalori',S.calories,k,'kcal')}${progress('Protein',S.protein,pg,'g')}<button class="wide-action" onclick="nav('scan')">📷 Yemek ekle</button></section>
   <section class="os-compact-grid two"><div class="os-mini-card"><span>HEDEF</span><b>${fmt(k)}</b><small>kcal / gün</small></div><div class="os-mini-card"><span>PROTEİN</span><b>${fmt(pg)}g</b><small>hedef / gün</small></div></section>`;
 if(homeTab==='water') content=`
   <section class="os-water-card"><div><span>HİDRASYON</span><b>${S.water} / 8</b><small>bardak tamamlandı</small></div><div class="water-dots">${Array.from({length:8},(_,i)=>`<i class="${i<S.water?'filled':''}">💧</i>`).join('')}</div><button class="wide-action" onclick="addWater()">+ 1 bardak su</button></section>`;
 app.innerHTML=`<div class="watch-shell v11-shell">
   <section class="watch-status"><span class="status-live"><i></i> LIVE</span><span>HEALTH OS</span><time id="systemTime">--:--</time></section>
   <section class="watch-hero compact-hero"><div class="watch-greeting"><div class="watch-overline">BUGÜN · ${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long'}).toUpperCase()}</div><h1>${S.name?`Merhaba ${esc(S.name)} 👋`:'Bugünkü sağlık'}</h1><p>Kısa ve net. Her şey tek bakışta.</p></div><div class="watch-score"><div class="score-ring" style="--score:${score}"><b>${score}</b><span>SKOR</span></div></div></section>
   <div class="home-tabs" role="tablist">${tabs.map(t=>`<button class="home-tab ${homeTab===t[0]?'active':''}" onclick="setHomeTab('${t[0]}')"><span>${t[2]}</span>${t[1]}</button>`).join('')}</div>
   ${content}
 </div>`;
 startClock(); updateStepUI();
}
function startClock(){clearInterval(window.__v10clock);const tick=()=>{const el=document.getElementById('systemTime');if(el)el.textContent=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});};tick();window.__v10clock=setInterval(tick,30000)}
function progress(name,a,b,unit){return `<div class="progress-row"><div class="progress-meta"><span>${name}</span><b>${fmt(a)} / ${fmt(b)}${unit?' '+unit:''}</b></div><div class="bar"><div class="fill" style="width:${pct(a,b)}%"></div></div></div>`}
function addWater(){S.water=Math.min(8,S.water+1);save();toast('Su eklendi');home()}
function addSteps(){S.steps+=500;save();toast('500 adım eklendi');home()}

function plan(){
 const total=mealData.reduce((s,m)=>s+m.foods.reduce((q,f)=>q+f[2],0),0);
 app.innerHTML=`<div class="wrap"><section class="system-strip"><span class="live-dot"></span><b>SİSTEM AKTİF</b><span>V11 HEALTH OS</span><span class="system-time" id="systemTime">--:--</span></section>
 <section class="card hero"><div class="kicker">PLAN</div><div class="title">Bugünün beslenme planı</div><div class="sub" style="margin-top:7px">Örnek plan ${total} kcal. Kişisel hedefin yaklaşık ${goalKcal()} kcal. Değerler tahminidir.</div></section>
 ${mealData.map(m=>{const done=S.mealsDone.includes(m.id),mc=m.foods.reduce((a,f)=>a+f[2],0);return `<section class="card meal-card"><div class="mealhead"><div class="mealicon">${m.icon}</div><div><div class="meal-title">${m.time} · ${m.name}</div><div class="meal-meta">${mc} kcal</div></div><input class="check" type="checkbox" ${done?'checked':''} onchange="toggleMeal('${m.id}')"></div>${m.foods.map(f=>`<div class="foodrow"><div><div class="foodname">${f[0]}</div><div class="tag">${f[1]} · P ${f[3]} g · K ${f[4]} g · Y ${f[5]} g</div></div><b>${f[2]} kcal</b></div>`).join('')}</section>`}).join('')}
 <section class="card"><div class="section-head"><div><div class="kicker">ALIŞVERİŞ</div><div class="title">Temel liste</div></div></div>${['Yumurta','Yulaf','Yoğurt','Tavuk göğsü','Bulgur','Mercimek','Sebzeler','Meyve','Badem'].map(x=>`<span class="tag" style="display:inline-block;background:var(--surface-2);padding:8px 10px;border-radius:99px;margin:3px">${x}</span>`).join('')}</section>
 </div>`;
}
function toggleMeal(id){const meal=mealData.find(x=>x.id===id);const has=S.mealsDone.includes(id);if(has)S.mealsDone=S.mealsDone.filter(x=>x!==id);else S.mealsDone.push(id);const kcal=meal.foods.reduce((a,f)=>a+f[2],0),protein=meal.foods.reduce((a,f)=>a+f[3],0);S.calories=Math.max(0,S.calories+(has?-kcal:kcal));S.protein=Math.max(0,S.protein+(has?-protein:protein));save();plan();}

async function scan(){
 app.innerHTML=`<div class="wrap">
 <section class="system-strip"><span class="live-dot"></span><b>SİSTEM AKTİF</b><span>V11 HEALTH OS</span><span class="system-time" id="systemTime">--:--</span></section>
 <section class="card hero"><div class="kicker">ANALİZ</div><div class="title">Yemeğini hızlıca kaydet</div><div class="sub" style="margin-top:7px">Fotoğraf, ürün araması veya barkod ile besin verisini bul.</div>
  <div class="scan-grid" style="margin-top:18px"><button class="scan-action" onclick="document.getElementById('photoInput').click()"><span class="scan-icon">▣</span>Fotoğraf<small>Yemek görseli</small></button><button class="scan-action" onclick="document.getElementById('foodSearch').focus()"><span class="scan-icon">⌕</span>Gıda ara<small>Open Food Facts</small></button><button class="scan-action" onclick="document.getElementById('barcode').focus()"><span class="scan-icon">▤</span>Barkod<small>13 hane</small></button></div>
 </section>
 <section class="card"><div class="section-head"><div><div class="kicker">FOTOĞRAF</div><div class="title">Yemek fotoğrafı</div></div></div>
 <div class="food-photo-drop" onclick="document.getElementById('photoInput').click()"><div style="font-size:30px">📷</div><strong>Fotoğraf seç veya kamera aç</strong><div class="tag">JPG, PNG · Telefon kamerası desteklenir</div></div>
 <input id="photoInput" style="display:none" type="file" accept="image/*" capture="environment" onchange="previewPhoto()">
 <div id="photoPreview"></div><button class="btn full" style="margin-top:10px" onclick="analyzePhoto()">✦ Fotoğrafı analiz et</button><div id="photoResult"></div></section>
 <section class="card"><div class="section-head"><div><div class="kicker">ÜRÜN ARAMA</div><div class="title">İnternetten gıda ara</div></div></div><input id="foodSearch" class="input" placeholder="Örn. yoğurt, yulaf, ayran"><button class="btn light full" onclick="searchFood()">Ürünleri getir</button><div id="foodResults"></div></section>
 <section class="card"><div class="section-head"><div><div class="kicker">BARKOD</div><div class="title">Ürünü barkoddan bul</div></div></div><input id="barcode" class="input" inputmode="numeric" placeholder="13 haneli barkodu yaz"><button class="btn light full" onclick="lookupBarcode()">Barkodu sorgula</button><div id="barcodeResult"></div></section>
 </div>`;
}
async function searchFood(){const q=document.getElementById('foodSearch').value.trim(),out=document.getElementById('foodResults');if(!q)return;out.innerHTML='<div class="notice">Ürünler aranıyor…</div>';try{const r=await fetch('https://world.openfoodfacts.org/cgi/search.pl?search_terms='+encodeURIComponent(q)+'&search_simple=1&action=process&json=1&page_size=8');const d=await r.json();const ps=(d.products||[]).filter(p=>p.product_name).slice(0,8);out.innerHTML=ps.length?ps.map(p=>{const f={name:p.product_name,kcal:Number(p.nutriments?.['energy-kcal_100g']||0),protein:Number(p.nutriments?.proteins_100g||0),carbs:Number(p.nutriments?.carbohydrates_100g||0),fat:Number(p.nutriments?.fat_100g||0)};return `<div class="result-card"><div class="foodname">${esc(p.product_name)}</div><div class="tag">${esc(p.brands||'')} · ${f.kcal||'?'} kcal / 100 g</div><button class="btn light" style="margin-top:10px" onclick='addFood(${JSON.stringify(f)})'>Günlüğe ekle</button></div>`}).join(''):'<div class="empty">Sonuç bulunamadı.</div>'}catch(e){out.innerHTML='<div class="notice">Veri servisine ulaşılamadı.</div>'}}
async function lookupBarcode(){const code=document.getElementById('barcode').value.trim(),out=document.getElementById('barcodeResult');if(!code)return;out.innerHTML='<div class="notice">Barkod aranıyor…</div>';try{const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json');const d=await r.json();if(d.status!==1)throw 0;const p=d.product||{},f={name:p.product_name||'Ürün',kcal:Number(p.nutriments?.['energy-kcal_100g']||0),protein:Number(p.nutriments?.proteins_100g||0),carbs:Number(p.nutriments?.carbohydrates_100g||0),fat:Number(p.nutriments?.fat_100g||0)};out.innerHTML=`<div class="success"><b>${esc(f.name)}</b><br>${f.kcal||'?'} kcal / 100 g · P ${f.protein||'?'} g · K ${f.carbs||'?'} g · Y ${f.fat||'?'} g<button class="btn light" style="margin-top:10px" onclick='addFood(${JSON.stringify(f)})'>Günlüğe ekle</button></div>`}catch(e){out.innerHTML='<div class="notice">Bu barkod Open Food Facts içinde bulunamadı.</div>'}}
function addFood(f){S.foods.push({...f,at:Date.now()});S.calories+=f.kcal;S.protein+=f.protein;save();toast('Günlüğe eklendi');nav('home')}
function previewPhoto(){const input=document.getElementById('photoInput'),prev=document.getElementById('photoPreview');if(input.files?.[0])prev.innerHTML=`<img class="photo" src="${URL.createObjectURL(input.files[0])}">`}
function analyzePhoto(){const input=document.getElementById('photoInput'),out=document.getElementById('photoResult'),prev=document.getElementById('photoPreview');if(!input.files?.[0]){out.innerHTML='<div class="notice">Önce bir fotoğraf seç.</div>';return}const file=input.files[0];prev.innerHTML=`<img class="photo" src="${URL.createObjectURL(file)}">`;if(cfg.backendUrl&&cfg.enableRemoteImageAI){out.innerHTML='<div class="notice">Güvenli analiz sunucusuna gönderiliyor…</div>';const fd=new FormData();fd.append('image',file);fetch(cfg.backendUrl.replace(/\/$/,'')+'/api/analyze-image',{method:'POST',body:fd}).then(r=>r.json()).then(d=>out.innerHTML=`<div class="success">${esc(d.summary||'Analiz tamamlandı.')}</div>`).catch(()=>out.innerHTML='<div class="notice">Sunucuya ulaşılamadı.</div>')}else out.innerHTML='<div class="notice">Fotoğraf akışı hazır. Gerçek görsel AI için config.js içindeki backendUrl alanına güvenli bir backend bağlamalısın.</div>'}

function diet(){const kcal=goalKcal(),pg=proteinGoal();const meals=[["07:30","Kahvaltı","Yulaf + yoğurt + meyve","≈ 420 kcal · 25 g protein"],["12:30","Öğle","Izgara tavuk + bulgur + salata","≈ 560 kcal · 45 g protein"],["16:00","Ara öğün","Yoğurt + bir avuç kuruyemiş","≈ 250 kcal · 12 g protein"],["19:30","Akşam","Sebzeli protein tabağı","≈ 520 kcal · 40 g protein"]];app.innerHTML=`<div class="wrap"><section class="card diet-hero"><div class="kicker">DİYET ASİSTANI</div><div class="title">Bugün için sade bir plan</div><div class="sub">Hedefin: ${fmt(kcal)} kcal · ${pg} g protein. Bu genel bir örnek plandır; kişisel tıbbi beslenme önerisi değildir.</div></section><section class="card"><div class="section-head"><div><div class="kicker">ÖĞÜN PLANI</div><div class="title">Bugünün seçenekleri</div></div></div><div class="meal-list">${meals.map(m=>`<div class="meal-row"><div class="meal-time">${m[0]}</div><div class="meal-copy"><div class="meal-title">${m[1]}</div><div class="meal-name">${m[2]}</div><div class="tag">${m[3]}</div></div><button class="meal-check" onclick="toast('Öğün işaretlendi ✓')">✓</button></div>`).join('')}</div></section><section class="card"><div class="section-head"><div><div class="kicker">HATIRLATICILAR</div><div class="title">Telefonuna bildirim gönder</div></div></div>${[['rWater','💧 Su','Düzenli su içme'],['rMeals','🍽️ Öğün','Kahvaltı / öğle / akşam'],['rSteps','👟 Hareket','Adım hedefini kontrol et'],['rNight','🌙 Gün sonu','Bugünü kapat']].map(x=>`<div class="reminder-row"><div><div class="stat-main">${x[1]}</div><div class="stat-sub">${x[2]}</div></div><label class="switch"><input id="${x[0]}" type="checkbox" onchange="saveReminders()"><span></span></label></div>`).join('')}<button class="btn full" style="margin-top:12px" onclick="enableNotifications()">🔔 Bildirim iznini aç</button><div class="tag" style="margin-top:10px">Bildirimler cihaz ve tarayıcı izinlerine bağlıdır.</div></section></div>`;loadReminders()}
function loadReminders(){const r=JSON.parse(localStorage.getItem('fitplan_reminders')||'{}');['rWater','rMeals','rSteps','rNight'].forEach(id=>{const e=document.getElementById(id);if(e)e.checked=!!r[id]})}
function saveReminders(){const r={};['rWater','rMeals','rSteps','rNight'].forEach(id=>{const e=document.getElementById(id);r[id]=!!e?.checked});localStorage.setItem('fitplan_reminders',JSON.stringify(r));toast('Hatırlatıcı kaydedildi');scheduleBrowserReminders()}
async function enableNotifications(){if(!('Notification' in window)){toast('Bildirim desteği yok');return}const p=await Notification.requestPermission();if(p==='granted'){toast('Bildirimler açıldı 🔔');scheduleBrowserReminders()}else toast('Bildirim izni verilmedi')}
function scheduleBrowserReminders(){if(!('Notification' in window)||Notification.permission!=='granted')return;clearTimeout(window._fitReminder);const r=JSON.parse(localStorage.getItem('fitplan_reminders')||'{}');const now=new Date(),t=[];if(r.rWater)t.push([10,0,'💧 Su zamanı','Bir bardak su içmeyi unutma.']);if(r.rMeals)t.push([12,30,'🍽️ Öğün zamanı','Bugünkü öğününü kontrol et.']);if(r.rSteps)t.push([17,30,'👟 Hareket zamanı','Kısa bir yürüyüşle adım hedefini ilerlet.']);if(r.rNight)t.push([21,30,'🌙 Gün sonu','Bugünkü hedeflerini kontrol et.']);if(!t.length)return;let best=null;for(const [h,m,title,body] of t){const d=new Date(now);d.setHours(h,m,0,0);if(d<=now)d.setDate(d.getDate()+1);if(!best||d<best.d)best={d,title,body}}window._fitReminder=setTimeout(()=>{try{new Notification(best.title,{body:best.body,icon:'icon.svg'})}catch(e){}scheduleBrowserReminders()},best.d-now)}
function profile(){
 const progress=Math.min(100,Math.max(0,100*(92-S.weight)/(92-S.target)));
 app.innerHTML=`<div class="wrap"><section class="card"><div class="profile-hero"><div class="avatar">${esc((S.name||'S')[0].toUpperCase())}</div><div><div class="kicker">PROFİL</div><div class="title">${S.name?esc(S.name):'Profilini tamamla'}</div><div class="sub">Hedeflerini ve günlük hesaplarını yönet.</div></div></div></section>
 <section class="card"><div class="section-head"><div><div class="kicker">KİŞİSEL BİLGİLER</div><div class="title">Profil ayarları</div></div></div>
 <label>Ad</label><input id="name" class="input" value="${esc(S.name)}">
 <label>Cinsiyet</label><select id="sex" class="select"><option value="male">Erkek</option><option value="female">Kadın</option></select>
 <label>Yaş</label><input id="age" class="input" type="number" min="14" max="100" value="${S.age}">
 <label>Boy (cm)</label><input id="height" class="input" type="number" min="120" max="230" value="${S.height}">
 <label>Mevcut kilo (kg)</label><input id="weight" class="input" type="number" step=".1" value="${S.weight}">
 <label>Hedef kilo (kg)</label><input id="target" class="input" type="number" step=".1" value="${S.target}">
 <label>Aktivite</label><select id="activity" class="select"><option value="1.2">Çok düşük</option><option value="1.35">Hafif</option><option value="1.5">Orta</option><option value="1.7">Yüksek</option></select>
 <button class="btn full" style="margin-top:10px" onclick="saveProfile()">Profili kaydet</button></section>
 <section class="card"><div class="kicker">HEDEF</div><div class="title">Kilo yolculuğun</div><div class="target-number" style="margin-top:8px">${S.weight} → ${S.target} kg</div><div class="bar" style="margin-top:14px"><div class="fill" style="width:${progress}%"></div></div><div class="sub" style="margin-top:8px">${Math.max(0,S.weight-S.target).toFixed(1)} kg kaldı</div></section>
 <section class="card"><div class="kpi-grid"><div class="kpi"><span class="tag">BMR</span><b>${Math.round(bmr())}</b><span class="tag">kcal</span></div><div class="kpi"><span class="tag">TDEE</span><b>${Math.round(tdee())}</b><span class="tag">kcal</span></div><div class="kpi"><span class="tag">Kalori hedefi</span><b>${goalKcal()}</b><span class="tag">kcal</span></div><div class="kpi"><span class="tag">Protein</span><b>${proteinGoal()}</b><span class="tag">g / gün</span></div></div></section>
 <section class="card"><div class="kicker">GİZLİLİK</div><div class="title">Verilerin</div><div class="sub" style="margin-top:7px">Profil ve günlük kayıtları bu sürümde cihazındaki localStorage alanında tutulur. Verilerin bu sürümde cihazındaki localStorage alanında tutulur.</div></section>
 <section class="card"><button class="btn danger full" onclick="resetAll()">Tüm verileri sıfırla</button></section>
 </div>`;
 document.getElementById('sex').value=S.sex;document.getElementById('activity').value=S.activity;
}
function saveProfile(){S.name=document.getElementById('name').value.trim();S.sex=document.getElementById('sex').value;S.age=+document.getElementById('age').value;S.height=+document.getElementById('height').value;S.weight=+document.getElementById('weight').value;S.target=+document.getElementById('target').value;S.activity=+document.getElementById('activity').value;S.weights=[...S.weights,S.weight].slice(-60);save();toast('Profil kaydedildi');updateProfileMini();home()}
function resetAll(){if(confirm('Tüm FitPlan verileri silinsin mi?')){localStorage.removeItem(KEY);location.reload()}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._deferred=e});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
updateProfileMini();nav('home');

// V7 HUD clock
function updateSystemClock(){const el=document.getElementById('systemTime');if(el)el.textContent=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});}
setInterval(updateSystemClock,1000); setTimeout(updateSystemClock,0);
