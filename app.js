console.log("🔥 APP START");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ======================
// SUPABASE
// ======================
const supabase = createClient(
  "https://hchrmmvmkdqqhknfytwi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaHJtbXZta2RxcWhrbmZ5dHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzM3NzQsImV4cCI6MjA5NDg0OTc3NH0.xrIR3ItK7rPynUXmTFj9EqtN-1WW7LboyI2nAfas57I"
);

// ======================
// STATE
// ======================
let messages = [];
let selectedId = null;
let isAdmin = false;
let maintenance = false;

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
// SETTINGS (MAINTENANCE GLOBAL)
// ======================
async function loadSettings() {

  console.log("📡 LOAD SETTINGS...");

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.log("SETTINGS ERROR", error);
    return;
  }

  maintenance = data?.maintenance;

  console.log("🛠️ MAINTENANCE =", maintenance);

  if (maintenance === true) {
    document.body.innerHTML = `
      <div class="maintenance">
        <h1>🛠️ Maintenance</h1>
        <p>Site temporairement fermé</p>
      </div>
    `;
    return;
  }
}

// ======================
// MESSAGES
// ======================
async function loadMessages() {

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.log("LOAD ERROR", error);
    return;
  }

  messages = data || [];
  render();
}

// ======================
// RENDER
// ======================
function render() {

  const search = (searchInput.value || "").toLowerCase();

  messagesDiv.innerHTML = "";

  messages
    .filter(m => (m.text || "").toLowerCase().includes(search))
    .forEach(m => {

      messagesDiv.innerHTML += `
        <div class="msg ${selectedId === m.id ? "selected" : ""}"
             onclick="selectMsg('${m.id}')">

          <b>${m.name}</b>
          <span class="small">${m.email}</span>

          <p>${m.text}</p>

          ${m.reply ? `<div class="reply">↳ ${m.reply}</div>` : ""}
        </div>
      `;
    });
}

// ======================
// SEND
// ======================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  await supabase.from("messages").insert([{
    name: nameInput.value,
    email: emailInput.value,
    text: textInput.value,
    reply: ""
  }]);

  form.reset();
  loadMessages();
});

// ======================
// SELECT
// ======================
window.selectMsg = function(id){
  const msg = messages.find(m => m.id === id);
  if(!msg) return;

  selectedId = id;
  selectedDiv.innerText = msg.text;
};

// ======================
// LOGIN
// ======================
window.login = function(){
  if(passInput.value === "admin123"){
    isAdmin = true;
    adminPanel.style.display = "block";
  }
};

// ======================
// REPLY
// ======================
window.reply = async function(){

  await supabase
    .from("messages")
    .update({ reply: replyInput.value })
    .eq("id", selectedId);

  replyInput.value = "";
  loadMessages();
};

// ======================
// COMMANDS
// ======================
window.runCmd = async function(){

  const c = cmdInput.value.split(" ");

  if (c[0] === "maintenance" && c[1] === "on") {
    await supabase.from("settings")
      .update({ maintenance: true })
      .eq("id", 1);
  }

  if (c[0] === "maintenance" && c[1] === "off") {
    await supabase.from("settings")
      .update({ maintenance: false })
      .eq("id", 1);
  }

  cmdInput.value = "";
};

// ======================
// INIT
// ======================
loadSettings();
loadMessages();
setInterval(loadSettings, 3000);
setInterval(loadMessages, 2000);
