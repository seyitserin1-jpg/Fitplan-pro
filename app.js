const state={tab:"today",water:0,meals:0,steps:0,active:0,goal:"Yağ kaybı"};
const app=document.querySelector("#app");
const toast=t=>{const x=document.querySelector("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1400)};
const pct=(a,b)=>Math.min(100,Math.round(a/b*100));
const stat=(i,l,v,u)=>`<div class="card stat"><div class="stat-icon">${i}</div><small>${l}</small><strong>${v}</strong><small>${u}</small></div>`;
function score(){return Math.round((pct(state.water,8)+pct(state.meals,3)+pct(state.steps,8000)+pct(state.active,20))/4)}
function today(){
const p=score();
return `<div class="kicker">BUGÜN</div><h1>Bugün senin günün.</h1><p class="sub">Küçük adımlar, daha iyi bir rutin.</p>
<section class="card hero"><div class="hero-line"><div><div class="kicker">GÜNLÜK İLERLEME</div><h2>${p>=70?"Harika gidiyorsun.":p>=35?"Ritmini yakalıyorsun.":"Hazırsan başlayalım."}</h2><p>Bugünkü hedeflerinin ${p}%'si tamamlandı.</p></div><div class="score">${p}%</div></div><div class="progress"><i style="width:${p}%"></i></div></section>
<div class="grid four">${stat("💧","Su",state.water,"/ 8 bardak")}${stat("🥗","Öğün",state.meals,"/ 3 tamam")}${stat("👟","Adım",state.steps.toLocaleString("tr-TR"),"/ 8.000")}${stat("◌","Aktif",state.active,"/ 20 dk")}</div>
<div class="head"><h2>Hızlı takip</h2><span>Bugün</span></div><section class="card quick">
${row("💧","Su içtim","Hidrasyon hedefi","water","+1")}
${row("🥗","Öğün tamamlandı","Beslenme planı","meal","Tamamla")}
${row("⌁","Aktivite tamamlandı","Günlük hareket","active","Tamamla")}
</section>`;
}
function row(i,t,s,a,b){return `<div class="row"><div class="row-left"><div class="ico">${i}</div><div><b>${t}</b><small>${s}</small></div></div><button class="action" data-a="${a}">${b}</button></div>`}
function diet(){
return `<div class="kicker">BESLENME</div><h1>Daha iyi beslen.</h1><p class="sub">Hedefine göre günlük planını şekillendir.</p>
<div class="grid three">${["🔥|Yağ kaybı|Daha kontrollü kalori","💪|Kas gelişimi|Protein odaklı","⚖️|Koruma|Dengeli beslenme"].map(x=>{let[a,b,c]=x.split("|");return `<div class="card choice ${state.goal==b?"selected":""}" data-goal="${b}"><div class="emoji">${a}</div><h3>${b}</h3><p>${c}</p></div>`}).join("")}</div>
<div class="head"><h2>Bugünkü özet</h2><span>${state.goal}</span></div><div class="grid three">${stat("🔥","Kalori","0","/ 2.674 kcal")}${stat("🥩","Protein","0g","/ 112g")}${stat("💧","Su",state.water,"/ 8 bardak")}</div>
<div class="head"><h2>Bugünün yönü</h2></div><section class="card advice"><div class="kicker">ÖNERİ</div><h2>Protein + lif ağırlıklı dengeli öğünler.</h2><p>Her ana öğünde bir protein kaynağı ve bol sebze tercih et. Gün boyunca yeterli su iç.</p></section>
<div class="head"><h2>Örnek öğünler</h2></div>${meal("🌅","Kahvaltı","Yumurta, yoğurt ve mevsim sebzeleri","Protein + lif")}${meal("☀️","Öğle","Izgara tavuk, bulgur ve salata","Dengeli")}${meal("🌙","Akşam","Yoğurtlu sebze yemeği ve protein","Hafif")}`;
}
function meal(e,t,d,g){return `<section class="card meal"><div class="meal-top"><div><h3>${e} ${t}</h3><p>${d}</p></div><span class="tag">${g}</span></div></section>`}
function activity(){
let p=pct(state.steps,8000);
return `<div class="kicker">AKTİF YAŞAM</div><h1>Hareket et, iyi hisset.</h1><p class="sub">Günlük hareketini sade ve anlaşılır şekilde takip et.</p>
<section class="card activity"><div class="kicker">ADIM HEDEFİ</div><div class="big">${state.steps.toLocaleString("tr-TR")}</div><div class="muted">8.000 günlük hedef</div><div class="progress"><i style="width:${p}%"></i></div><div class="mini muted">${p}% tamamlandı</div></section>
<div class="head"><h2>Aktivite özeti</h2></div><div class="grid two">${stat("🔥","Aktif enerji","0","kcal")}${stat("◷","Hareket",state.active,"dakika")}</div>
<div class="head"><h2>Bugünün planı</h2></div><section class="card advice"><div class="kicker">20 DAKİKA</div><h2>Hafif ama düzenli hareket.</h2><p>Kısa yürüyüş, esneme veya sevdiğin hafif bir egzersiz seç.</p><button class="action" data-a="active">Hareketi tamamla</button></section>`;
}
function health(){
let p=score();
return `<div class="kicker">HEALTH OS</div><h1>Sağlığının özeti.</h1><p class="sub">Günlük verilerini tek, sakin bir görünümde takip et.</p>
<div class="grid two">${healthCard("HİDRASYON",pct(state.water,8),"Su hedefi")}${healthCard("BESLENME",pct(state.meals,3),"Günlük plan")}${healthCard("AKTİVİTE",pct(state.steps,8000),"Hareket")}${healthCard("RUTİN",p,"Genel düzen")}</div>
<div class="head"><h2>FitPlan analizi</h2></div><section class="card advice"><div class="kicker">BUGÜNKÜ ÖZET</div><h2>${p>=70?"Dengeli bir gün geçiriyorsun.":p>=35?"Temel hedeflerin iyi ilerliyor.":"Bugün için küçük bir başlangıç yeterli."}</h2><p>Verilerin arttıkça FitPlan önerilerini daha kişisel hale getirecek. Buradaki alan ilerleyen sürümlerde daha gelişmiş analizlerle genişletilecek.</p></section>`;
}
function healthCard(a,b,c){return `<div class="card stat"><small>${a}</small><strong>${b}%</strong><small>${c}</small><div class="progress"><i style="width:${b}%"></i></div></div>`}
function render(){
app.innerHTML={today,diet,activity,health}[state.tab]();
document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.tab===state.tab));
document.querySelectorAll("[data-a]").forEach(x=>x.onclick=()=>{if(x.dataset.a==="water")state.water=Math.min(8,state.water+1);if(x.dataset.a==="meal")state.meals=Math.min(3,state.meals+1);if(x.dataset.a==="active"){state.active=Math.min(20,state.active+20);state.steps=Math.min(8000,state.steps+1500)}toast("Güncellendi ✓");render()});
document.querySelectorAll("[data-goal]").forEach(x=>x.onclick=()=>{state.goal=x.dataset.goal;toast("Hedef güncellendi ✓");render()});
}
document.querySelectorAll(".nav").forEach(x=>x.onclick=()=>{state.tab=x.dataset.tab;render()});
document.querySelector("#profileBtn").onclick=()=>toast("Profil alanı yakında");
render();
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
