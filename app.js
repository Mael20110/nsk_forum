console.log("🔥 APP START");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ======================
// SUPABASE
// ======================
const supabase = createClient(
  "https://hchrmmvmkdqqhknfytwi.supabase.co",
  "TA_ANON_KEY"
);

// ======================
// STATE
// ======================
let messages = [];
let selectedId = null;
let isAdmin = false;

// ======================
// BAD WORDS
// ======================
const badWords = [
  "merde",
  "putain",
  "fuck",
  "shit",
  "ntm",
  "enculé",
  "hitler",
  "fdp",
  "connard",
  "connasse",
  "salope",
  "pute",
  "encule",
  "batard",
  "bâtard",
  "fils de pute",
  "nique",
  "nique ta mère",
  "tg",
  "ta gueule",
  "bitch",
  "asshole",
  "motherfucker",
  "dick",
  "cunt",
  "bastard",
  "go kill yourself",
  "kill yourself",
  "kys",
  "suicide",
  "retard",
  "retarded",
  "raciste",
  "nazis",
  "nazi",
  "white power",
  "black monkey"
];

// ======================
// ELEMENTS
// ======================
const form = document.getElementById("form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const textInput = document.getElementById("text");

const messagesDiv = document.getElementById("messages");
const searchInput = document.getElementById("search");

const passInput = document.getElementById("pass");
const adminPanel = document.getElementById("admin");

const selectedDiv = document.getElementById("selected");
const replyInput = document.getElementById("reply");
const cmdInput = document.getElementById("cmd");

// ======================
// LOAD SETTINGS
// ======================
async function loadSettings(){

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if(error || !data) return;

  if(data.maintenance === true){

    let screen = document.getElementById("maintenanceScreen");

    if(!screen){

      screen = document.createElement("div");

      screen.id = "maintenanceScreen";

      screen.innerHTML = `
        <h1>🛠️ Maintenance</h1>
        <p>Site temporairement fermé</p>
      `;

      document.body.appendChild(screen);
    }

  } else {

    const old = document.getElementById("maintenanceScreen");

    if(old){
      old.remove();
    }
  }
}

// ======================
// LOAD MESSAGES
// ======================
async function loadMessages(){

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending:true });

  if(error){
    console.log("LOAD ERROR:", error);
    return;
  }

  messages = data || [];

  syncLocalReplies();

  render();
}

// ======================
// LOCAL REPLIES
// ======================
function syncLocalReplies(){

  const local = JSON.parse(localStorage.getItem("myMessages") || "[]");

  local.forEach(localMsg => {

    const found = messages.find(m => m.text === localMsg.text);

    if(found && found.reply){

      if(localMsg.reply !== found.reply){

        localMsg.reply = found.reply;

        if(!localMsg.notified){
          alert("🔔 Nouvelle réponse admin !");
          localMsg.notified = true;
        }
      }
    }
  });

  localStorage.setItem("myMessages", JSON.stringify(local));

  renderMyMessages();
}

// ======================
// RENDER LOCAL MESSAGES
// ======================
function renderMyMessages(){

  const box = document.getElementById("myMessagesList");

  if(!box) return;

  const local = JSON.parse(localStorage.getItem("myMessages") || "[]");

  box.innerHTML = "";

  local.forEach(m => {

    box.innerHTML += `
      <div class="myReply">

        <div><b>Vous :</b> ${m.text}</div>

        ${m.reply
          ? `<div class="notif">🔔 Réponse admin :</div>
             <div>${m.reply}</div>`
          : `<div>Aucune réponse</div>`
        }

      </div>
    `;
  });
}

// ======================
// RENDER
// ======================
function render(){

  const search = (searchInput.value || "").toLowerCase();

  messagesDiv.innerHTML = "";

  messages
    .filter(m => !m.blocked)
    .filter(m => (m.text || "").toLowerCase().includes(search))
    .forEach(m => {

      messagesDiv.innerHTML += `
        <div class="msg ${selectedId === m.id ? "selected" : ""}"
             onclick="selectMsg('${m.id}')">

          <b>${m.name || "Anonyme"}</b>
          <span class="small">${m.email || ""}</span>

          <p>${m.text || ""}</p>

          ${m.reply
            ? `<div class="reply">↳ ${m.reply}</div>`
            : ""
          }

        </div>
      `;
    });
}

// ======================
// SEND MESSAGE
// ======================
form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const text = textInput.value.toLowerCase();

  if(badWords.some(w => text.includes(w))){
    alert("⛔ Message bloqué (insulte)");
    return;
  }

  const payload = {
    name: nameInput.value,
    email: emailInput.value,
    text: textInput.value,
    reply: "",
    blocked: false
  };

  const { error } = await supabase
    .from("messages")
    .insert([payload]);

  if(error){
    console.log("INSERT ERROR:", error);
    return;
  }

  const saved = JSON.parse(localStorage.getItem("myMessages") || "[]");

  saved.push({
    text: textInput.value,
    reply: "",
    notified: false
  });

  localStorage.setItem("myMessages", JSON.stringify(saved));

  form.reset();

  loadMessages();
});

// ======================
// SELECT MESSAGE
// ======================
window.selectMsg = function(id){

  const msg = messages.find(m => m.id == id);

  if(!msg) return;

  selectedId = id;

  selectedDiv.innerHTML = `
    <b>${msg.name}</b><br>
    ${msg.text}
  `;
};

// ======================
// LOGIN ADMIN
// ======================
window.login = function(){

  if(passInput.value === "admin123"){

    isAdmin = true;

    adminPanel.style.display = "block";

    alert("Admin connecté");
  }
};

// ======================
// REPLY
// ======================
window.reply = async function(){

  if(!selectedId) return;

  await supabase
    .from("messages")
    .update({
      reply: replyInput.value
    })
    .eq("id", selectedId);

  replyInput.value = "";

  loadMessages();
};

// ======================
// BAN MESSAGE
// ======================
async function banMessage(id){

  await supabase
    .from("messages")
    .update({
      blocked:true
    })
    .eq("id", id);

  alert("🚫 Message banni");

  loadMessages();
}

// ======================
// COMMANDS
// ======================
window.runCmd = async function(){

  const c = cmdInput.value.split(" ");

  if(c[0] === "ban"){
    banMessage(c[1]);
  }

  if(c[0] === "maintenance" && c[1] === "on"){

    await supabase
      .from("settings")
      .update({ maintenance:true })
      .eq("id", 1);

    alert("🛠️ Maintenance ON");
  }

  if(c[0] === "maintenance" && c[1] === "off"){

    await supabase
      .from("settings")
      .update({ maintenance:false })
      .eq("id", 1);

    alert("🟢 Maintenance OFF");
  }

  cmdInput.value = "";
};

// ======================
// BAN SELECTED
// ======================
window.banSelected = async function(){

  if(!selectedId){
    alert("Aucun message sélectionné");
    return;
  }

  banMessage(selectedId);
};

// ======================
// INIT
// ======================
loadSettings();
loadMessages();

setInterval(loadMessages, 2000);
setInterval(loadSettings, 3000);
