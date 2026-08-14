const S={steps:+localStorage.getItem("fp_steps")||127,water:+localStorage.getItem("fp_water")||0,protein:+localStorage.getItem("fp_protein")||0,calories:+localStorage.getItem("fp_calories")||0};
const $=s=>document.querySelector(s), clamp=(n,a,b)=>Math.max(a,Math.min(b,n)), pct=(v,m)=>clamp(Math.round(v/m*100),0,100);
const save=()=>["steps","water","protein","calories"].forEach(k=>localStorage.setItem("fp_"+k,S[k]));
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove("show"),2500)}
function render(){
 $("#steps").textContent=S.steps.toLocaleString("tr-TR");$("#water").textContent=S.water;$("#protein").textContent=S.protein+"g";$("#calories").textContent=S.calories;
 $("#dietProtein").textContent=`${S.protein} / 112g`;$("#dietWater").textContent=`${S.water} / 8`;
 $("#stepsBar").style.width=pct(S.steps,8000)+"%";$("#waterBar").style.width=pct(S.water,8)+"%";$("#proteinBar").style.width=pct(S.protein,112)+"%";$("#calBar").style.width=pct(S.calories,2674)+"%";
 const score=Math.round((pct(S.steps,8000)+pct(S.water,8)+pct(S.protein,112)+pct(S.calories,2674))/4);$("#score").textContent=score;$("#scoreRing").style.setProperty("--score",score+"%");
 $("#healthState").textContent=S.steps>0?"Otomatik":"Hazır";coach();save();
}
function coach(){let t="Günün ilk adımı",p="Önce 1 bardak su iç.";if(S.water<4){t="Öncelik: hidrasyon 💧";p=`Bugün ${S.water}/8 bardaktasın. Şimdi 1 bardak su iç.`}else if(S.steps<3000){t="Şimdi biraz hareket 🚶";p=`${S.steps.toLocaleString("tr-TR")} adımdasın. Kısa bir yürüyüş iyi bir sonraki adım.`}else if(S.protein<80){t="Protein hedefini tamamla 💪";p=`${S.protein}g aldın. Bir sonraki öğünde protein ağırlıklı seçim yap.`}else{t="Çok iyi gidiyorsun ✨";p="Temel hedeflerini tamamlamaya devam et."}$("#coachTitle").textContent=t;$("#coachText").textContent=p;$("#dietDirective").textContent=t;$("#dietDirectiveText").textContent=p}
function clock(){let d=new Date();$("#clock").textContent=d.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});$("#todayDate").textContent=d.toLocaleDateString("tr-TR",{day:"2-digit",month:"long"}).toUpperCase()}setInterval(clock,1000);clock();

const pages=$("#pages"), navs=[...document.querySelectorAll(".nav")], pageNames=["today","diet","plan","profile"];
function go(name){let i=pageNames.indexOf(name);if(i<0)return;pages.scrollTo({left:i*pages.clientWidth,behavior:"smooth"});navs.forEach(n=>n.classList.toggle("active",n.dataset.target===name))}
navs.forEach(n=>n.onclick=()=>go(n.dataset.target));
let lock=false;pages.addEventListener("scroll",()=>{if(lock)return;let i=Math.round(pages.scrollLeft/pages.clientWidth);navs.forEach(n=>n.classList.toggle("active",pageNames[i]===n.dataset.target))},{passive:true});
$("#topProfile").onclick=()=>go("profile");

$("#coachAction").onclick=()=>{if(S.water<8){S.water++;toast("Koç görevi tamamlandı 💧")}else{S.steps+=250;toast("+250 adım hedefe eklendi 🚶")}render()};
$("#waterQuick").onclick=()=>{S.water=Math.min(8,S.water+1);render();toast("1 bardak su kaydedildi 💧")};
$("#mealQuick").onclick=()=>go("diet");
$("#notifyQuick").onclick=()=>openNotifications();

document.querySelectorAll(".goal").forEach(b=>b.onclick=()=>{document.querySelectorAll(".goal").forEach(x=>x.classList.remove("active"));b.classList.add("active");let g=b.dataset.goal;$("#dietDirective").textContent=g==="lose"?"Kilo verme modu: sürdürülebilir açık.":g==="gain"?"Kas geliştirme modu: protein ve düzenli öğün öncelikli.":"Koruma modu: dengeli ve sürdürülebilir seçimler.";});
document.querySelectorAll(".meal-done").forEach(b=>b.onclick=()=>{S.protein=Math.min(112,S.protein+28);render();toast("Öğün kaydedildi · +28g protein varsayıldı");});

function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.add("show")}
$("#closeModal").onclick=()=>$("#modal").classList.remove("show");
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.remove("show")};

function isStandalone(){return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true}
async function openNotifications(){
 if(!("Notification" in window)){openModal(`<h2>🔔 Bildirimleri aç</h2><p>Bu tarayıcı oturumunda bildirim API'si kullanılamıyor. FitPlan Pro'yu iPhone Ana Ekranı'na uygulama olarak ekle ve oradan aç.</p><button class="primary" onclick="document.querySelector('#modal').classList.remove('show')">Tamam</button>`);return}
 if(!isStandalone()){
  openModal(`<h2>🔔 Önce uygulamayı kur</h2><p>Android'de FitPlan Pro'yu Chrome'dan Ana Ekran'a ekle veya Android uygulamasını kur. Ardından Bildirim iznini ver.</p><button class="primary" id="notifInstallClose">Anladım</button>`);return;
 }
 try{
  const p=await Notification.requestPermission();
  $("#notificationStatus").textContent=p==="granted"?"Açık":p==="denied"?"iPhone Ayarlarından izin ver":"Beklemede";
  if(p==="granted"){toast("Bildirim izni açıldı 🔔"); if("serviceWorker" in navigator){const reg=await navigator.serviceWorker.ready;try{await reg.showNotification("FitPlan Pro",{body:"Bildirimler hazır. Bugünün ilk hedefi seni bekliyor.",icon:"icon.svg"});}catch(e){}}}
  else if(p==="denied")openModal(`<h2>🔔 Bildirim izni kapalı</h2><p>Android'de <b>Ayarlar → Bildirimler → FitPlan Pro</b> yolundan bildirimleri açabilirsin.</p><button class="primary" onclick="document.querySelector('#modal').classList.remove('show')">Tamam</button>`);
 }catch(e){toast("Bildirim izni açılamadı. Uygulamayı Ana Ekran'dan açmayı dene.")}
}
$("#notificationSettings").onclick=openNotifications;
$("#installSettings").onclick=()=>openModal(`<h2>📲 FitPlan Pro'yu kur</h2><p>Chrome'da menü → <b>Ana ekrana ekle</b> seçeneğini kullan. En iyi arka plan sağlık ve bildirim deneyimi için FitPlan Pro Android uygulamasını kur.</p><button class="primary" onclick="document.querySelector('#modal').classList.remove('show')">Tamam</button>`);
$("#healthSettings").onclick=()=>openModal(`<h2>❤️ Otomatik sağlık</h2><p>V16 web sürümü hareket sensörünü otomatik kullanabilir. Android'de gerçek arka plan sağlık senkronu için Health Connect ve native Android katmanı kullanılır. Kullanıcıdan sağlık izinleri açıkça alınır.</p><button class="primary" id="connectHealth">Hareket sensörünü bağla</button>`);
$("#reminderSettings").onclick=()=>openModal(`<h2>⏰ Hatırlatıcılar</h2><p>Su, öğün, hareket ve gece hatırlatıcılarını seç. Gerçek uygulama kapalı push teslimi için Web Push sunucusu/VAPID backend gereklidir.</p><div class="form-row"><label>Su</label><select><option>Açık</option><option>Kapalı</option></select></div><div class="form-row"><label>Öğün</label><select><option>Açık</option><option>Kapalı</option></select></div><div class="form-row"><label>Hareket</label><select><option>Açık</option><option>Kapalı</option></select></div><button class="primary" onclick="document.querySelector('#modal').classList.remove('show');toast('Hatırlatıcı tercihleri kaydedildi')">Kaydet</button>`);
$("#goalSettings").onclick=()=>openModal(`<h2>🎯 Günlük hedefler</h2><p>V16 hedef motoru adım, su, protein ve enerji metriklerini birlikte değerlendirir. Bir sonraki aşamada kişisel hedef hesabını boy/kilo/yaş/aktivite bilgileriyle otomatikleştirebiliriz.</p><button class="primary" onclick="document.querySelector('#modal').classList.remove('show')">Tamam</button>`);

let last=0,lastStep=0;
async function motion(){
 if(!window.DeviceMotionEvent){toast("Hareket sensörü desteklenmiyor.");return}
 try{if(typeof DeviceMotionEvent.requestPermission==="function"){let p=await DeviceMotionEvent.requestPermission();if(p!=="granted"){toast("Hareket izni verilmedi.");return}}
  window.addEventListener("devicemotion",e=>{let a=e.accelerationIncludingGravity;if(!a)return;let m=Math.hypot(a.x||0,a.y||0,a.z||0),d=Math.abs(m-last);last=m;if(d>2&&Date.now()-lastStep>450){S.steps++;lastStep=Date.now();render()}});
  $("#sensorStatus").textContent="Aktif · uygulama açıkken sensör takibi · Android uygulaması arka planda Health Connect ile senkronlar";$("#sensorBtn").textContent="Aktif";toast("Otomatik hareket takibi aktif 🚶");
 }catch(e){toast("Hareket izni açılamadı.")}
}
$("#sensorBtn").onclick=motion;
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
if("Notification" in window)$("#notificationStatus").textContent=Notification.permission==="granted"?"Açık":Notification.permission==="denied"?"iPhone Ayarlarından izin ver":"Hazır";
render();

window.__fitplanNativeSteps=function(n){ if(Number.isFinite(n)){ S.steps=n; render(); toast("Android sağlık verisi senkronlandı ✓"); }};
if(window.FitPlanNative){ try{ window.FitPlanNative.syncNow(); }catch(e){} }
