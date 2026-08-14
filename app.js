const state = {
  steps: Number(localStorage.getItem("steps") || 129),
  water: Number(localStorage.getItem("water") || 0),
  protein: Number(localStorage.getItem("protein") || 0),
  calories: Number(localStorage.getItem("calories") || 0),
  goal: localStorage.getItem("goal") || "Yağ kaybı"
};

const targets = {
  steps: 8000,
  water: 8,
  protein: 112,
  calories: 2674
};

function save(){
  localStorage.setItem("steps", state.steps);
  localStorage.setItem("water", state.water);
  localStorage.setItem("protein", state.protein);
  localStorage.setItem("calories", state.calories);
  localStorage.setItem("goal", state.goal);
}

function el(id){
  return document.getElementById(id);
}

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}

function update(){
  const stepPct = clamp(state.steps / targets.steps * 100,0,100);
  const waterPct = clamp(state.water / targets.water * 100,0,100);
  const proteinPct = clamp(state.protein / targets.protein * 100,0,100);
  const caloriePct = clamp(state.calories / targets.calories * 100,0,100);

  if(el("steps")) el("steps").textContent = state.steps.toLocaleString("tr-TR");
  if(el("water")) el("water").textContent = state.water;
  if(el("protein")) el("protein").textContent = state.protein + "g";

  const calorieEl = document.querySelector("#metrics .metric:nth-child(2) strong");
  if(calorieEl) calorieEl.textContent = state.calories;

  document.querySelectorAll(".progress i").forEach((bar,index)=>{
    const values=[stepPct,caloriePct,proteinPct,waterPct];
    if(values[index] !== undefined){
      bar.style.width = values[index] + "%";
    }
  });

  const activityPct = Math.round(stepPct);

  if(el("activityPct")) el("activityPct").textContent = activityPct + "%";
  if(el("ringPct")) el("ringPct").textContent = activityPct + "%";

  const ring = document.querySelector(".ring");
  if(ring){
    ring.style.background =
      `conic-gradient(#26324a ${activityPct * 3.6}deg,#e9edf4 ${activityPct * 3.6}deg)`;
  }

  const legend = document.querySelectorAll(".legend span b");
  if(legend.length >= 2){
    legend[0].textContent = caloriePct.toFixed(0) + "%";
    legend[1].textContent = activityPct + "%";
  }

  save();
}

function addWater(amount=1){
  state.water = clamp(state.water + amount,0,targets.water);
  update();
  notify("💧 Su takibi","1 bardak su kaydedildi.");
}

function addSteps(amount=500){
  state.steps += amount;
  update();
  notify("🚶 Aktivite","Hareket hedefin güncellendi.");
}

function addProtein(amount=20){
  state.protein = clamp(state.protein + amount,0,targets.protein);
  update();
}

function addCalories(amount=250){
  state.calories = clamp(state.calories + amount,0,targets.calories);
  update();
}

function setGoal(button,goal){
  document.querySelectorAll(".goal").forEach(x=>{
    x.classList.remove("active");
  });

  if(button) button.classList.add("active");

  state.goal = goal;
  save();

  notify("🎯 Hedef güncellendi",goal);
}

function go(index){
  const screens = document.querySelectorAll(".screen");
  const buttons = document.querySelectorAll(".bottom button");

  screens.forEach((screen,i)=>{
    screen.classList.toggle("active",i === index);
  });

  buttons.forEach((button,i)=>{
    button.classList.toggle("active",i === index);
  });

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

async function requestNotifications(){
  if(!("Notification" in window)){
    alert("Bu cihazda bildirim desteği bulunamadı.");
    return;
  }

  const permission = await Notification.requestPermission();

  if(permission === "granted"){
    notify(
      "🔔 FitPlan Pro",
      "Bildirimler aktif. Su ve öğün hatırlatmaları hazır."
    );

    localStorage.setItem("notifications","on");
  }
}

function notify(title,message){
  if("Notification" in window &&
     Notification.permission === "granted"){
    new Notification(title,{
      body:message,
      icon:"icon.svg"
    });
  }
}

function setupReminders(){
  const notifications =
    localStorage.getItem("notifications") === "on";

  if(!notifications) return;

  setInterval(()=>{
    const now = new Date();
    const minutes = now.getMinutes();

    if(minutes === 0){
      notify(
        "💧 FitPlan Pro",
        "Su içme zamanı. Bugünkü su hedefini unutma."
      );
    }
  },60000);
}

function setupProfile(){
  const avatar = document.querySelector(".avatar");

  if(avatar){
    avatar.addEventListener("click",()=>{
      go(3);
    });
  }
}

function setupButtons(){
  document.querySelectorAll(".bottom button")
    .forEach((button,index)=>{
      button.addEventListener("click",()=>{
        go(index);
      });
    });

  document.querySelectorAll(".goal")
    .forEach(button=>{
      button.addEventListener("click",()=>{
        const text =
          button.innerText.replace(/\s+/g," ").trim();

        setGoal(button,text);
      });
    });

  const waterButton =
    document.querySelector(".addwater");

  if(waterButton){
    waterButton.addEventListener("click",()=>{
      addWater(1);
    });
  }
}

function setDate(){
  const date = el("date");

  if(!date) return;

  const now = new Date();

  const text = now.toLocaleDateString("tr-TR",{
    day:"2-digit",
    month:"long"
  }).toUpperCase();

  date.textContent = text;
}

function welcome(){
  const hour = new Date().getHours();
  let greeting = "Merhaba Seyit 👋";

  if(hour < 12) greeting = "Günaydın Seyit ☀️";
  else if(hour < 18) greeting = "İyi günler Seyit 👋";
  else greeting = "İyi akşamlar Seyit 🌙";

  const h1 = document.querySelector(".hero h1");

  if(h1) h1.textContent = greeting;
}

function init(){
  setupButtons();
  setupProfile();
  setDate();
  welcome();
  update();
  setupReminders();

  go(0);
}

document.addEventListener("DOMContentLoaded",init);
