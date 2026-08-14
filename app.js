const state = {
  steps: Number(localStorage.getItem("fp_steps") || 127),
  water: Number(localStorage.getItem("fp_water") || 0),
  protein: Number(localStorage.getItem("fp_protein") || 0),
  calories: Number(localStorage.getItem("fp_calories") || 0),
  reminders: JSON.parse(localStorage.getItem("fp_reminders") || "null") || {water:true,meal:true,move:true,night:true},
  notificationAsked: localStorage.getItem("fp_notificationAsked") === "1",
  sensorActive:false
};
const $ = s => document.querySelector(s);
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
const save = ()=>{["steps","water","protein","calories"].forEach(k=>localStorage.setItem("fp_"+k,state[k]));localStorage.setItem("fp_reminders",JSON.stringify(state.reminders));};

function pct(v,max){return clamp(Math.round(v/max*100),0,100)}
function render(){
  $("#steps").textContent = state.steps.toLocaleString("tr-TR");
  $("#water").textContent = state.water;
  $("#protein").textContent = state.protein+"g";
  $("#calories").textContent = state.calories;
  $("#dietProtein").textContent = `${state.protein} / 112g`;
  $("#stepsBar").style.width = pct(state.steps,8000)+"%";
  $("#waterBar").style.width = pct(state.water,8)+"%";
  $("#proteinBar").style.width = pct(state.protein,112)+"%";
  $("#calBar").style.width = pct(state.calories,2674)+"%";
  $("#waterText").textContent = `${state.water} / 8`;
  $("#waterP").textContent = pct(state.water,8)+"%";
  $("#moveP").textContent = pct(state.steps,8000)+"%";
  $("#energyP").textContent = pct(state.calories,2674)+"%";
  const score = Math.round((pct(state.steps,8000)+pct(state.water,8)+pct(state.protein,112)+pct(state.calories,2674))/4);
  $("#score").textContent = score;
  $("#scoreRing").style.setProperty("--score",score+"%");
  $("#activityPercent").textContent = pct(state.steps,8000)+"%";
  $("#activityRing").textContent = pct(state.steps,8000)+"%";
  $(".big-ring").style.setProperty("--activity",pct(state.steps,8000)+"%");
  renderCups(); renderCoach(); renderTimeline(); save();
}
function renderCups(){
  const wrap=$("#waterCups"); wrap.innerHTML="";
  for(let i=1;i<=8;i++){const b=document.createElement("button");b.className="cup "+(i<=state.water?"done":"");b.textContent=i<=state.water?"💧":"○";b.onclick=()=>{state.water=i;render()};wrap.appendChild(b)}
}
function renderCoach(){
  let title="Günün ilk adımı", text="Hedeflerini tamamlamak için önce 1 bardak su iç.";
  if(state.water<4){title="Öncelik: hidrasyon 💧";text=`Bugün ${state.water}/8 bardaktasın. Şimdi 1 bardak su iç.`}
  else if(state.steps<3000){title="Şimdi biraz hareket 🚶";text=`${state.steps.toLocaleString("tr-TR")} adımdasın. Kısa bir yürüyüş iyi bir sonraki adım.`}
  else if(state.protein<80){title="Protein hedefini tamamla 💪";text=`${state.protein}g aldın. Bir sonraki öğünde protein ağırlıklı seçim yap.`}
  else {title="Çok iyi gidiyorsun ✨";text="Bugünkü hedeflerini tamamlamaya devam et."}
  $("#coachTitle").textContent=title;$("#coachText").textContent=text;
}
function renderTimeline(){
 const items=[["08:00","💧","Su","1 bardak"],["09:00","🍳","Kahvaltı","Protein + dengeli karbonhidrat"],["11:30","🚶","Hareket","10–15 dk yürüyüş"],["13:00","🥗","Öğle","Protein + sebze + su"],["16:00","💧","Su","1 bardak"],["19:00","🍲","Akşam","Protein ağırlıklı, hafif"],["21:30","🌙","Gün sonu","Hedeflerini kontrol et"]];
 $("#timeline").innerHTML=items.map(x=>`<div class="time-item"><span class="time">${x[0]}</span><span class="line"></span><div><b>${x[1]} ${x[2]}</b><small>${x[3]}</small></div></div>`).join("");
}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(window._toast);window._toast=setTimeout(()=>x.classList.remove("show"),2400)}
function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.add("show")}
$("#closeModal").onclick=()=>$("#modal").classList.remove("show");
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.remove("show")};

function notify(text){
 if("Notification" in window && Notification.permission==="granted") new Notification("FitPlan Pro",{body:text,icon:"icon.svg"});
}
async function askNotifications(){
 if(!("Notification" in window)){toast("Bu tarayıcı bildirimleri desteklemiyor.");return}
 const p=await Notification.requestPermission();
 state.notificationAsked=true;localStorage.setItem("fp_notificationAsked","1");
 $("#notifyStatus").textContent=p==="granted"?"Açık":p==="denied"?"Engellendi":"Kapalı";
 toast(p==="granted"?"Bildirimler açıldı 🔔":"Bildirim izni verilmedi.");
 if(p==="granted")notify("FitPlan Pro hazır. Bugünün hedefleri seni bekliyor.");
}
$("#notifyBtn").onclick=askNotifications;
$("#reminderBtn").onclick=()=>openModal(`<h2>🔔 Hatırlatıcılar</h2><p>İstediğin hatırlatıcıları açıp kapat. Web/PWA ortamında zamanlanmış bildirimlerin çalışması cihaz ve tarayıcı izinlerine bağlıdır.</p>
<div class="form-row"><label>💧 Su</label><select id="rWater"><option value="on">Açık</option><option value="off">Kapalı</option></select></div>
<div class="form-row"><label>🥗 Öğün</label><select id="rMeal"><option value="on">Açık</option><option value="off">Kapalı</option></select></div>
<div class="form-row"><label>🚶 Hareket</label><select id="rMove"><option value="on">Açık</option><option value="off">Kapalı</option></select></div>
<div class="form-row"><label>🌙 Gece</label><select id="rNight"><option value="on">Açık</option><option value="off">Kapalı</option></select></div>
<button class="primary full" id="saveRem">Ayarları kaydet</button>`);
$("#modal").addEventListener("click",e=>{
 if(e.target.id==="saveRem"){["water","meal","move","night"].forEach(k=>state.reminders[k]=$("#r"+k[0].toUpperCase()+k.slice(1)).value==="on");save();$("#modal").classList.remove("show");toast("Hatırlatıcı ayarları kaydedildi.");}
});
$("#goalBtn").onclick=()=>openModal(`<h2>🎯 Günlük hedefler</h2><div class="form-row"><label>Adım</label><input id="gSteps" type="number" value="8000"></div><div class="form-row"><label>Su (bardak)</label><input id="gWater" type="number" value="8"></div><div class="form-row"><label>Protein (g)</label><input id="gProtein" type="number" value="112"></div><button class="primary full" id="saveGoal">Kaydet</button>`);
$("#installBtn").onclick=()=>toast("Safari'de Paylaş → Ana Ekrana Ekle ile kurabilirsin.");
$("#dietGoalBtn").onclick=()=>openModal(`<h2>🥗 Beslenme hedefin</h2><p>V15 şimdilik hedefe göre yönlendirme sunuyor. Daha gelişmiş kişiselleştirme için yaş, boy, kilo ve hedef bilgilerini profilinden tanımlayabiliriz.</p><button class="primary full" onclick="document.querySelector('#modal').classList.remove('show')">Tamam</button>`);
document.addEventListener("click",e=>{
 if(e.target.id==="saveGoal"){localStorage.setItem("fp_goal_steps",$("#gSteps").value);localStorage.setItem("fp_goal_water",$("#gWater").value);localStorage.setItem("fp_goal_protein",$("#gProtein").value);$("#modal").classList.remove("show");toast("Hedefler kaydedildi.");}
});
document.querySelectorAll(".meal").forEach(m=>m.onclick=()=>{const name=m.dataset.meal;openModal(`<h2>${name}</h2><p><b>FitPlan önerisi:</b> Öğününü protein, sebze ve yeterli su etrafında dengeli tut. İstersen V15'in sonraki sürümünde bu bölümü gerçek yemek veritabanı ve kişisel planlayıcıyla genişletebiliriz.</p><button class="primary full" onclick="document.querySelector('#modal').classList.remove('show')">Tamam</button>`)});
$("#addWater").onclick=()=>{if(state.water<8){state.water++;render();toast("Su kaydedildi 💧");if(state.water===8)notify("Harika! Bugünkü su hedefin tamamlandı.");}};
$("#coachAction").onclick=()=>{if(state.water<8){state.water++;render();toast("Koç görevi tamamlandı 💧")}else if(state.steps<8000){state.steps+=250;render();toast("Hareket hedefin için +250 adım")}else{toast("Bugünkü temel hedefler tamamlandı ✨")}};

function jump(id){const el=$("#"+id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})}
document.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>jump(b.dataset.jump));
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");jump(b.dataset.nav==="today"?"today":b.dataset.nav)});
$("#profileTop").onclick=()=>jump("profile");

let lastMag=0,lastStepTime=0;
function motionHandler(e){
 const a=e.accelerationIncludingGravity;if(!a)return;
 const mag=Math.sqrt((a.x||0)**2+(a.y||0)**2+(a.z||0)**2);
 const delta=Math.abs(mag-lastMag);lastMag=mag;
 const now=Date.now();
 if(delta>2.0 && now-lastStepTime>420){state.steps++;lastStepTime=now;render();}
}
async function startSensor(){
 if(!window.DeviceMotionEvent){$("#sensorStatus").textContent="Cihaz sensörü desteklenmiyor";return}
 try{
   if(typeof DeviceMotionEvent.requestPermission==="function"){
     const p=await DeviceMotionEvent.requestPermission();
     if(p!=="granted"){toast("Hareket izni verilmedi.");return}
   }
   window.addEventListener("devicemotion",motionHandler);
   state.sensorActive=true;$("#sensorStatus").textContent="Aktif · ekran açıkken otomatik hareket takibi";$("#sensorBtn").textContent="Aktif";
   toast("Otomatik hareket takibi başladı.");
 }catch(e){$("#sensorStatus").textContent="Sensör başlatılamadı";}
}
$("#sensorBtn").onclick=startSensor;

function clock(){
 const d=new Date();$("#clock").textContent=d.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
 $("#todayDate").textContent=d.toLocaleDateString("tr-TR",{day:"2-digit",month:"long"}).toUpperCase();
}
setInterval(clock,1000);clock();render();

if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
if("Notification" in window) $("#notifyStatus").textContent=Notification.permission==="granted"?"Açık":Notification.permission==="denied"?"Engellendi":"Kapalı";
