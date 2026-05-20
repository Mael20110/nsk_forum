// ======================
// DATA
// ======================
let messages = JSON.parse(localStorage.getItem("msgs")) || [];
let selectedId = null;
let isAdmin = false;

const badWords = ["merde","putain","fuck"];

// ======================
// ELEMENTS
// ======================
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

// ======================
// SAVE
// ======================
function save(){
  localStorage.setItem("msgs", JSON.stringify(messages));
}

// ======================
// SAFE ID
// ======================
function uid(){
  return crypto.randomUUID();
}

// ======================
// CLEAN DATA (ANTI BUG)
// ======================
function cleanData(){
  messages = messages.filter(m =>
    m &&
    m.id !== undefined &&
    m.text !== undefined
  );
}

// ======================
// RENDER
// ======================
function render(){

  cleanData();

  const searchVal = searchInput.value?.toLowerCase() || "";

  messagesDiv.innerHTML = "";

  messages
    .filter(m => m.text.toLowerCase().includes(searchVal))
    .forEach(m => {

      messagesDiv.innerHTML += `
        <div class="msg ${selectedId===m.id ? 'selected' : ''}"
             onclick="selectMsg('${m.id}')">

          ${isAdmin ? `
            <div class="admin-check">
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

// ======================
// SEND MESSAGE
// ======================
form.addEventListener("submit", async (e)=>{
  e.preventDefault();

  console.log("🚀 TEST ENVOI");

  const result = await supabase
    .from("messages")
    .insert([
      {
        name: "DEBUG",
        email: "debug@test.com",
        text: "HELLO TEST",
        reply: ""
      }
    ]);

  console.log("RESULT:", result);
});
// ======================
// SELECT MESSAGE (FIXED SAFE)
// ======================
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
    selectedDiv.innerText = msg.text || "(vide)";
  }

  render();
}

// ======================
// ADMIN LOGIN (FIXED)
// ======================
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

// ======================
// REPLY
// ======================
window.reply = function(){

  const msg = messages.find(m => String(m.id) === String(selectedId));

  if(!msg){
    alert("Aucun message sélectionné");
    return;
  }

  msg.reply = replyInput.value;

  save();
  render();
}

// ======================
// COMMANDS
// ======================
window.runCmd = function(){

  const c = cmdInput.value.split(" ");

  if(c[0] === "delete"){
    messages = messages.filter(m => String(m.id) !== String(c[1]));
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

// ======================
// LIVE UPDATE
// ======================
setInterval(() => {
  const newData = JSON.parse(localStorage.getItem("msgs")) || [];

  if(JSON.stringify(newData) !== JSON.stringify(messages)){
    messages = newData;
    render();
  }
}, 800);

// ======================
// SEARCH
// ======================
searchInput.addEventListener("input", render);

// ======================
// INIT
// ======================
render();
