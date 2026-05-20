// ===== DATA =====
let messages = JSON.parse(localStorage.getItem("msgs")) || [];
let selectedId = null;
let isAdmin = false;

const badWords = ["merde","putain","fuck"];

// ===== ELEMENTS =====
const form = document.getElementById("form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const textInput = document.getElementById("text");
const searchInput = document.getElementById("search");

const messagesDiv = document.getElementById("messages");
const selectedDiv = document.getElementById("selected");

const passInput = document.getElementById("pass");
const adminPanel = document.getElementById("admin");

const replyInput = document.getElementById("reply");
const cmdInput = document.getElementById("cmd");

// ===== SAVE =====
function save(){
  localStorage.setItem("msgs", JSON.stringify(messages));
}

// ===== ID =====
function uid(){
  return Date.now() + Math.random();
}

// ===== RENDER =====
function render(){
  const searchVal = searchInput.value?.toLowerCase() || "";

  messagesDiv.innerHTML = "";

  messages
    .filter(m => m.text.toLowerCase().includes(searchVal))
    .forEach(m => {

      messagesDiv.innerHTML += `
        <div class="msg ${selectedId===m.id ? 'selected' : ''}">

          ${isAdmin ? `
            <div class="admin-check" onclick="selectMsg('${m.id}')">
              ${selectedId===m.id ? "☑️" : "⬜"}
            </div>
          ` : ""}

          <b>${m.name}</b>
          <span class="small">${m.email}</span>

          <p>${m.text}</p>

          <span class="small">${m.time}</span>

          ${m.reply ? `<div style="color:#00ff88">↳ ${m.reply}</div>` : ""}
        </div>
      `;
    });
}

// ===== SEND MESSAGE =====
form.addEventListener("submit", e=>{
  e.preventDefault();

  const txt = textInput.value.toLowerCase();

  if(badWords.some(w => txt.includes(w))){
    alert("Message bloqué");
    return;
  }

  messages.push({
    id: uid(),
    name: nameInput.value,
    email: emailInput.value,
    text: textInput.value,
    reply: "",
    time: new Date().toLocaleString()
  });

  save();
  render();
  form.reset();
});

// ===== SELECT MESSAGE (ADMIN) =====
window.selectMsg = function(id){

  const msg = messages.find(m => String(m.id) === String(id));

  if(!msg){
    console.log("Message introuvable :", id);
    return;
  }

  if(selectedId === id){
    selectedId = null;
    selectedDiv.innerText = "Aucun";
  } else {
    selectedId = id;
    selectedDiv.innerText = msg.text;
  }

  render();
}
// ===== LOGIN ADMIN (IMPORTANT FIX) =====
window.login = function(){

  if(passInput.value.trim() === "admin123"){
    isAdmin = true;
    adminPanel.style.display = "block";
    alert("Admin connecté");
    render();
  } else {
    alert("Mot de passe incorrect");
  }
}

// ===== REPLY =====
window.reply = function(){
  const msg = messages.find(m => m.id === selectedId);
  if(!msg) return;

  msg.reply = replyInput.value;

  save();
  render();
}

// ===== COMMAND SYSTEM =====
window.runCmd = function(){
  const c = cmdInput.value.split(" ");

  if(c[0] === "delete"){
    messages = messages.filter(m => m.id != c[1]);
  }

  if(c[0] === "clear"){
    messages = [];
  }

  if(c[0] === "ban"){
    badWords.push(c[1]);
  }

  save();
  render();
}

// ===== LIVE UPDATE =====
setInterval(()=>{
  const newData = JSON.parse(localStorage.getItem("msgs")) || [];

  if(JSON.stringify(newData) !== JSON.stringify(messages)){
    messages = newData;
    render();
  }
},800);

// ===== SEARCH =====
searchInput.addEventListener("input", render);

// ===== INIT =====
render(); 
