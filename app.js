const $=s=>document.querySelector(s);
const state=JSON.parse(localStorage.getItem("fitplan_v21")||"null")||{
 page:"today",water:0,steps:0,active:0,calories:0,protein:0,meals:0,goal:"Yağ kaybı",name:"S",reminders:true
};
const save=()=>localStorage.setItem("fitplan_v21",JSON.stringify(state));
const toast=t=>{const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
const pct=(a,b)=>Math.min(100,Math.round((a/b)*100));

function render(){
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
 const pages={today:today,diet:diet,activity:activity,health:health};
 $("#app").innerHTML=pages[state.page]();
 bind();
}
function today(){
 const total=Math.round((pct(state.water,8)+pct(state.steps,8000)+pct(state.active,30)+pct(state.meals,3))/4);
 return `<div class="page-kicker">BUGÜN</div><h1>Günün kontrolü</h1><p class="lead">Küçük adımlar. Daha düzenli bir sen.</p>
 <div class="hero"><div class="hero-row"><div><div class="page-kicker">GÜNLÜK İLERLEME</div><h2>${total}% tamamlandı</h2><p>Bugünkü hedeflerine ne kadar yaklaştığını takip et.</p></div><div class="ring" style="--p:${total}%"><strong>${total}%</strong></div></div><div class="progress"><i style="width:${total}%"></i></div></div>
 <div class="grid">
  ${metric("💧","Su",`${state.water}/8`,"bardak")}
  ${metric("👣","Adım",state.steps.toLocaleString("tr-TR"),"hedef 8.000")}
  ${metric("🏃","Aktivite",`${state.active}`,"dakika")}
  ${metric("🥗","Öğün",`${state.meals}/3`,"öğün")}
 </div>
 <div class="section-title"><h3>Hızlı işlemler</h3><span>bugün</span></div>
 <div class="grid"><button class="card" data-add="water">💧<br><b>Su ekle</b><br><span class="muted">+1 bardak</span></button>
 <button class="card" data-add="steps">👣<br><b>Adım ekle</b><br><span class="muted">+500 adım</span></button></div>
 <div class="card" style="margin-top:12px"><div class="page-kicker">BUGÜNÜN ODAĞI</div><h3 style="font-size:21px">Protein + lif ağırlıklı beslenme.</h3><p class="muted">Su hedefini gün içine yay, kısa hareket molaları ver ve öğünlerini düzenli tut.</p></div>`;
}
function metric(i,l,v,s){return `<div class="card metric"><div class="metric-icon">${i}</div><div><div class="metric-label">${l}</div><div class="metric-value">${v}</div><div class="muted">${s}</div></div></div>`}
function diet(){
 const calPct=pct(state.calories,2674), proPct=pct(state.protein,112);
 return `<div class="page-kicker">BESLENME</div><h1>Diyet planın</h1><p class="lead">Hedefin: <b>${state.goal}</b></p>
 <div class="pills">${["Yağ kaybı","Kas gelişimi","Koruma"].map(x=>`<button class="pill ${state.goal===x?"active":""}" data-goal="${x}">${x}</button>`).join("")}</div>
 <div class="grid" style="margin-top:14px">${metric("🔥","Kalori",state.calories.toLocaleString("tr-TR"),"/ 2.674 kcal")}${metric("💪","Protein",state.protein,"/ 112 g")}</div>
 <div class="card" style="margin-top:12px"><div class="metric-label">KALORİ İLERLEMESİ</div><div class="progress"><i style="width:${calPct}%"></i></div><div class="metric-label" style="margin-top:13px">PROTEİN İLERLEMESİ</div><div class="progress"><i style="width:${proPct}%"></i></div></div>
 <div class="section-title"><h3>Bugünün öğünleri</h3><span>${state.meals}/3 tamamlandı</span></div>
 <div class="list">${meal("🌅","Kahvaltı","Protein + lif","Yumurta, yoğurt ve sebze",0)}${meal("☀️","Öğle","Dengeli tabak","Tavuk, bulgur ve salata",1)}${meal("🌙","Akşam","Hafif protein","Balık, yoğurt ve sebze",2)}</div>
 <button class="action" id="addMeal">Öğün tamamla</button>`;
}
function meal(e,t,a,d,n){return `<div class="meal"><div class="emoji">${e}</div><div style="flex:1"><strong>${t}</strong><small>${a} · ${d}</small></div><span class="pill">${state.meals>n?"✓":"+"}</span></div>`}
function activity(){
 return `<div class="page-kicker">AKTİF YAŞAM</div><h1>Hareket merkezi</h1><p class="lead">Bugün biraz hareket etmek bile fark yaratır.</p>
 <div class="hero"><div class="page-kicker">BUGÜNÜN HEDEFİ</div><div class="stat-big">${state.active}<span style="font-size:18px"> dk</span></div><p>30 dakika aktif hareket</p><div class="progress"><i style="width:${pct(state.active,30)}%"></i></div><button class="action" id="activityBtn">20 dakika aktif kal</button></div>
 <div class="grid">${metric("👣","Adım",state.steps.toLocaleString("tr-TR"),"8.000 hedef")}${metric("🔥","Aktif enerji",state.calories>0?Math.round(state.calories*.12):0,"kcal")}</div>
 <div class="section-title"><h3>Hareket fikirleri</h3></div>
 <div class="list">${["20 dk tempolu yürüyüş","10 dk esneme","15 dk ev egzersizi"].map(x=>`<div class="meal"><div class="emoji">✨</div><div><strong>${x}</strong><small>Bugün için uygun</small></div></div>`).join("")}</div>`;
}
function health(){
 const score=Math.round((pct(state.water,8)+pct(state.steps,8000)+pct(state.active,30)+pct(state.meals,3))/4);
 return `<div class="page-kicker">HEALTH OS</div><h1>Sağlık kontrolü</h1><p class="lead">Günlük durumunun genel görünümü.</p>
 <div class="hero"><div class="hero-row"><div><div class="page-kicker">GENEL SKOR</div><div class="stat-big">${score}<span style="font-size:18px">/100</span></div><p>Düzenli veri girdikçe daha anlamlı hale gelir.</p></div><div class="ring" style="--p:${score}%"><strong>${score}</strong></div></div></div>
 <div class="list">${healthRow("💧","Hidrasyon",pct(state.water,8)+"%","Su hedefi")}${healthRow("🥗","Beslenme",pct(state.meals,3)+"%","Günlük plan")}${healthRow("🏃","Aktivite",pct(state.active,30)+"%","Hareket")}${healthRow("🌙","Rutin",state.reminders?"Açık":"Kapalı","Hatırlatmalar")}</div>
 <div class="section-title"><h3>Kişisel öneri</h3></div><div class="card"><h3>${score<40?"Bugün temel hedeflere odaklan.":"Ritmini koru."}</h3><p class="muted">${score<40?"Önce su, ardından kısa bir yürüyüş ve düzenli bir öğün.":"İyi gidiyorsun. Küçük ve sürdürülebilir adımlarına devam et."}</p></div>`;
}
function healthRow(i,t,v,s){return `<div class="meal"><div class="emoji">${i}</div><div style="flex:1"><strong>${t}</strong><small>${s}</small></div><b>${v}</b></div>`}

function bind(){
 document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;save();render();window.scrollTo(0,0)});
 document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{if(b.dataset.add==="water")state.water=Math.min(8,state.water+1);else state.steps+=500;save();render();toast("Güncellendi ✓")});
 document.querySelectorAll("[data-goal]").forEach(b=>b.onclick=()=>{state.goal=b.dataset.goal;save();render();toast("Hedef güncellendi")});
 $("#addMeal")?.addEventListener("click",()=>{state.meals=Math.min(3,state.meals+1);state.calories=Math.min(2674,state.calories+650);state.protein=Math.min(112,state.protein+30);save();render();toast("Öğün tamamlandı ✓")});
 $("#activityBtn")?.addEventListener("click",()=>{state.active=Math.min(30,state.active+20);state.steps+=1500;save();render();toast("20 dakika eklendi ✓")});
}
function openProfile(){
 $("#modalContent").innerHTML=`<div class="page-kicker">PROFİL</div><h2 style="font-size:28px;margin:0 0 20px">Kişisel ayarlar</h2>
 <label class="metric-label">Ad / baş harf</label><input class="input" id="nameInput" value="${state.name}">
 <div class="switch"><div><b>Günlük hatırlatmalar</b><div class="muted">Su, öğün ve hareket bildirimleri</div></div><input type="checkbox" id="rem" ${state.reminders?"checked":""}></div>
 <button class="action" id="saveProfile">Kaydet</button>
 <button class="action secondary" id="reset">Bugünkü verileri sıfırla</button>`;
 $("#modal").classList.add("show");
 $("#saveProfile").onclick=()=>{state.name=($("#nameInput").value||"S").slice(0,2).toUpperCase();state.reminders=$("#rem").checked;$("#profileBtn").textContent=state.name;save();$("#modal").classList.remove("show");render();toast("Ayarlar kaydedildi")};
 $("#reset").onclick=()=>{state.water=state.steps=state.active=state.calories=state.protein=state.meals=0;save();$("#modal").classList.remove("show");render();toast("Bugün sıfırlandı")};
}
$("#profileBtn").onclick=openProfile;$("#closeModal").onclick=()=>$("#modal").classList.remove("show");
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.remove("show")};
$("#profileBtn").textContent=state.name||"S";render();
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
