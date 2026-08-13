const app=document.getElementById('app');
const KEY='fitplan_v5';
const defaults={name:'',sex:'male',age:30,height:175,weight:92,target:78,activity:1.4,water:0,steps:0,sleep:0,calories:0,protein:0,mealsDone:[],weights:[],foods:[]};
let S=Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||'{}'));
const cfg=window.FITPLAN_CONFIG||{};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
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
 ({home,plan,scan,coach,profile}[page]||home)();
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

function home(){
 const k=goalKcal(),pg=proteinGoal(),calPct=pct(S.calories,k),waterPct=pct(S.water,8),proteinPct=pct(S.protein,pg),stepPct=pct(S.steps,8000);
 const score=Math.round((waterPct+proteinPct+stepPct)/3), remaining=Math.max(0,S.weight-S.target);
 const bars=[18,34,27,51,42,66,Math.max(8,score)];
 const labels=['Pzt','Sal','Çar','Per','Cum','Cmt','Bug'];
 app.innerHTML=`<div class="wrap">
 <section class="card hero">
   <div class="kicker">BUGÜN · ${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long'})}</div>
   <h2 class="greeting">${S.name?`Merhaba ${esc(S.name)} 👋`:'FitPlan Pro’ya hoş geldin 👋'}</h2>
   <div class="sub">Bugün mükemmel olmak zorunda değil. Sadece dünden biraz daha iyi ol.</div>
   <div class="hero-row" style="margin-top:22px">
     <div>
       <div class="kicker">KALORİ DENGESİ</div>
       <div class="calorie-number">${fmt(S.calories)} <span>/ ${fmt(k)} kcal</span></div>
       <div class="bar" style="margin-top:12px"><div class="fill" style="width:${calPct}%"></div></div>
       <div class="tag" style="margin-top:7px">${Math.max(0,k-S.calories)} kcal hedefe kaldı</div>
     </div>
     <div class="ring" style="--p:${score}">
       <div class="ring-content"><div class="ring-value">${score}%</div><div class="ring-label">uyum skoru</div></div>
     </div>
   </div>
   <div class="metrics">
     <div class="metric"><div class="metric-label">💪 Protein</div><div class="metric-value">${S.protein} g</div><div class="metric-target">/ ${pg} g</div></div>
     <div class="metric"><div class="metric-label">💧 Su</div><div class="metric-value">${S.water}</div><div class="metric-target">/ 8 bardak</div></div>
     <div class="metric"><div class="metric-label">👟 Adım</div><div class="metric-value">${fmt(S.steps)}</div><div class="metric-target">/ 8.000</div></div>
   </div>
 </section>

 <section class="card">
   <div class="section-head"><div><div class="kicker">HIZLI KAYIT</div><div class="title">Bugününü güncelle</div></div></div>
   <div class="quick-actions">
     <button class="btn" onclick="addWater()">💧 +1 bardak</button>
     <button class="btn light" onclick="addSteps()">👟 +500 adım</button>
   </div>
   <div class="quick-actions" style="margin-top:9px">
     <button class="btn light" onclick="nav('scan')">📷 Yemek ekle</button>
     <button class="btn light" onclick="nav('coach')">✦ Koça sor</button>
   </div>
 </section>

 <section class="card">
   <div class="section-head"><div><div class="kicker">HAFTALIK TREND</div><div class="title">İlerleme ritmin</div></div><span class="tag">Son 7 gün</span></div>
   <div class="chart">${bars.map((v,i)=>`<div class="chart-col"><div class="chart-bar" style="height:${v}%"></div><div class="chart-label">${labels[i]}</div></div>`).join('')}</div>
   <div class="insight"><div class="insight-icon">✦</div><div><div class="foodname">Bugünün içgörüsü</div><div class="tag" style="margin-top:3px">${esc(coachSummary())}</div></div></div>
 </section>

 <section class="card">
   <div class="section-head"><div><div class="kicker">GÜNLÜK HEDEFLER</div><div class="title">Durumun</div></div></div>
   ${progress('Protein',S.protein,pg,'g')}
   ${progress('Su',S.water,8,'bardak')}
   ${progress('Adım',S.steps,8000,'')}
   <div class="divider"></div>
   <div class="premium-stat"><div class="stat-left"><div class="stat-icon">🔥</div><div><div class="stat-main">Kalori</div><div class="stat-sub">Günlük enerji hedefi</div></div></div><div class="stat-number">${fmt(k)} kcal</div></div>
   <div class="premium-stat"><div class="stat-left"><div class="stat-icon">🎯</div><div><div class="stat-main">Hedefe kalan</div><div class="stat-sub">${S.weight} kg → ${S.target} kg</div></div></div><div class="stat-number">${remaining.toFixed(1)} kg</div></div>
 </section>

 <section class="card">
   <div class="section-head"><div><div class="kicker">BUGÜNÜN AKIŞI</div><div class="title">Sıradaki adımlar</div></div><button class="btn ghost" onclick="nav('plan')">Tüm plan</button></div>
   <div class="timeline">${events.slice(0,6).map(e=>`<div class="event"><span class="event-time">${e[0]}</span><span class="event-dot">${e[1]}</span><span class="event-name">${e[2]}</span><span class="event-tag">${e[0]<'12:00'?'Sabah':'Gün'}</span></div>`).join('')}</div>
 </section>

 <section class="card coach-card">
   <div class="coach-badge">✦</div><div class="kicker" style="color:rgba(255,255,255,.55)">FITPLAN AI</div>
   <div class="title" style="font-size:23px">Bugünün koç mesajı</div>
   <p>${esc(coachSummary())}</p>
   <button class="btn light" onclick="nav('coach')">Detaylı konuş</button>
 </section>
 </div>`;
}
function progress(name,a,b,unit){return `<div class="progress-row"><div class="progress-meta"><span>${name}</span><b>${fmt(a)} / ${fmt(b)}${unit?' '+unit:''}</b></div><div class="bar"><div class="fill" style="width:${pct(a,b)}%"></div></div></div>`}
function coachSummary(){if(!S.name)return'Profilini tamamladığında öneriler günlük kayıtlarına göre kişiselleştirilebilir.';if(S.protein<proteinGoal()*.5)return'Protein hedefinin gerisindesin. Bir sonraki öğünde yoğurt, yumurta, tavuk, balık veya baklagil gibi bir kaynak düşünebilirsin.';if(S.water<4)return'Su takibin bugün biraz geride. Bir sonraki saat içinde bir bardak su eklemek iyi bir başlangıç.';if(S.steps<4000)return'Hareketin bugün düşük görünüyor. Uygunsa kısa ve rahat bir yürüyüş ekleyebilirsin.';return'Bugünkü temel hedeflerin iyi gidiyor. Mükemmel olmak yerine istikrarlı kalmaya odaklan.'}
function addWater(){S.water=Math.min(8,S.water+1);save();toast('Su eklendi');home()}
function addSteps(){S.steps+=500;save();toast('500 adım eklendi');home()}

function plan(){
 const total=mealData.reduce((s,m)=>s+m.foods.reduce((q,f)=>q+f[2],0),0);
 app.innerHTML=`<div class="wrap"><section class="card hero"><div class="kicker">PLAN</div><div class="title">Bugünün beslenme planı</div><div class="sub" style="margin-top:7px">Örnek plan ${total} kcal. Kişisel hedefin yaklaşık ${goalKcal()} kcal. Değerler tahminidir.</div></section>
 ${mealData.map(m=>{const done=S.mealsDone.includes(m.id),mc=m.foods.reduce((a,f)=>a+f[2],0);return `<section class="card meal-card"><div class="mealhead"><div class="mealicon">${m.icon}</div><div><div class="meal-title">${m.time} · ${m.name}</div><div class="meal-meta">${mc} kcal</div></div><input class="check" type="checkbox" ${done?'checked':''} onchange="toggleMeal('${m.id}')"></div>${m.foods.map(f=>`<div class="foodrow"><div><div class="foodname">${f[0]}</div><div class="tag">${f[1]} · P ${f[3]} g · K ${f[4]} g · Y ${f[5]} g</div></div><b>${f[2]} kcal</b></div>`).join('')}</section>`}).join('')}
 <section class="card"><div class="section-head"><div><div class="kicker">ALIŞVERİŞ</div><div class="title">Temel liste</div></div></div>${['Yumurta','Yulaf','Yoğurt','Tavuk göğsü','Bulgur','Mercimek','Sebzeler','Meyve','Badem'].map(x=>`<span class="tag" style="display:inline-block;background:var(--surface-2);padding:8px 10px;border-radius:99px;margin:3px">${x}</span>`).join('')}</section>
 </div>`;
}
function toggleMeal(id){const meal=mealData.find(x=>x.id===id);const has=S.mealsDone.includes(id);if(has)S.mealsDone=S.mealsDone.filter(x=>x!==id);else S.mealsDone.push(id);const kcal=meal.foods.reduce((a,f)=>a+f[2],0),protein=meal.foods.reduce((a,f)=>a+f[3],0);S.calories=Math.max(0,S.calories+(has?-kcal:kcal));S.protein=Math.max(0,S.protein+(has?-protein:protein));save();plan();}

async function scan(){
 app.innerHTML=`<div class="wrap">
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

function coach(){
 app.innerHTML=`<div class="wrap">
 <section class="card coach-card">
   <div class="coach-badge">✦</div><div class="kicker" style="color:rgba(255,255,255,.55)">FITPLAN AI · PREMIUM</div>
   <div class="title" style="font-size:26px">Bugün neyi birlikte çözelim?</div>
   <div class="sub">Kayıtlarına göre genel, pratik öneriler sunarım. Sağlık teşhisi yapmam.</div>
 </section>
 <section class="card">
   <div id="messages" class="chat-wrap"><div class="message bot">${esc(coachSummary())}</div></div>
   <div style="margin-top:12px"><input id="question" class="input" placeholder="Örn. Bugün proteinimi nasıl tamamlarım?"></div>
   <button class="btn full" style="margin-top:10px" onclick="ask()">Gönder ↗</button>
 </section>
 <section class="card">
   <div class="kicker">HIZLI SORULAR</div>
   <div class="quick-grid" style="margin-top:12px">
    <button class="btn light" onclick="quick('Bugün ne yemeliyim?')">🍽️ Bugün ne yemeliyim?</button>
    <button class="btn light" onclick="quick('Protein hedefime nasıl ulaşırım?')">💪 Proteinimi tamamla</button>
    <button class="btn light" onclick="quick('Akşam için öneri ver.')">🌙 Akşam önerisi</button>
    <button class="btn light" onclick="quick('Bugünkü kalorimi nasıl dengelerim?')">🔥 Kalori dengesi</button>
   </div>
 </section></div>`;
}
function quick(q){document.getElementById('question').value=q;ask()}
async function ask(){const q=document.getElementById('question').value.trim();if(!q)return;const box=document.getElementById('messages');box.innerHTML+=`<div class="message user">${esc(q)}</div>`;if(cfg.backendUrl&&cfg.enableRemoteAI){box.innerHTML+='<div class="message bot" id="typing">Düşünüyorum…</div>';try{const r=await fetch(cfg.backendUrl.replace(/\/$/,'')+'/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,profile:{age:S.age,sex:S.sex,height:S.height,weight:S.weight,target:S.target,activity:S.activity},today:{water:S.water,steps:S.steps,protein:S.protein,calories:S.calories}})});const d=await r.json();document.getElementById('typing').outerHTML=`<div class="message bot">${esc(d.answer||'Yanıt alınamadı.')}</div>`}catch(e){document.getElementById('typing').outerHTML=`<div class="message bot">${esc(localCoach(q))}</div>`}}else box.innerHTML+=`<div class="message bot">${esc(localCoach(q))}</div>`;document.getElementById('question').value=''}
function localCoach(q){const x=q.toLowerCase();if(x.includes('protein'))return`Protein hedefin yaklaşık ${proteinGoal()} g. Bugün ${S.protein} g aldın; yaklaşık ${Math.max(0,proteinGoal()-S.protein)} g kaldı.`;if(x.includes('kalori'))return`Günlük tahmini enerji hedefin ${goalKcal()} kcal. Bugün ${S.calories} kcal kaydettin. Değerler tahminidir.`;if(x.includes('akşam'))return'Akşam öğününde protein ve sebzeyi öne çıkarıp toplam enerji hedefini göz önünde bulundurabilirsin.';if(x.includes('kilo'))return'Sürdürülebilir ve kademeli ilerlemeye odaklan. Düzenli öğün, yeterli protein, hareket ve uyku önemli.';return coachSummary()}

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
 <section class="card"><div class="kicker">GİZLİLİK</div><div class="title">Verilerin</div><div class="sub" style="margin-top:7px">Profil ve günlük kayıtları bu sürümde cihazındaki localStorage alanında tutulur. Uzaktan AI kullanırsan yalnızca backend'e gönderdiğin alanlar işlenir.</div></section>
 <section class="card"><button class="btn danger full" onclick="resetAll()">Tüm verileri sıfırla</button></section>
 </div>`;
 document.getElementById('sex').value=S.sex;document.getElementById('activity').value=S.activity;
}
function saveProfile(){S.name=document.getElementById('name').value.trim();S.sex=document.getElementById('sex').value;S.age=+document.getElementById('age').value;S.height=+document.getElementById('height').value;S.weight=+document.getElementById('weight').value;S.target=+document.getElementById('target').value;S.activity=+document.getElementById('activity').value;S.weights=[...S.weights,S.weight].slice(-60);save();toast('Profil kaydedildi');updateProfileMini();home()}
function resetAll(){if(confirm('Tüm FitPlan verileri silinsin mi?')){localStorage.removeItem(KEY);location.reload()}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._deferred=e});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
updateProfileMini();nav('home');
