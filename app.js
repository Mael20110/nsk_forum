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
// BAD WORDS
// ======================
const badWords = [
  "merde",
  "putain",
  "fuck",
  "shit",
  "ntm",
  "enculé"
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
// LOAD SETTINGS (MAINTENANCE GLOBAL)
// ======================
async function loadSettings() {

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.log("SETTINGS ERROR:", error);
    return;
  }

  maintenance = data?.maintenance;

  console.log("🛠️ MAINTENANCE =", maintenance);

  if (maintenance === true) {

    document.body.innerHTML = `
      <div class="maintenance">
        <h1>🛠️ Maintenance en cours</h1>
        <p>Site temporairement fermé</p>
      </div>
    `;

    return;
  }
}

// ======================
// LOAD MESSAGES
// ======================
async function loadMessages() {

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.log("LOAD ERROR:", error);
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
    .filter(m => !m.blocked)
    .filter(m => (m.text || "").toLowerCase().includes(search))
    .forEach(m => {

      messagesDiv.innerHTML += `
        <div class="msg ${selectedId === m.id ? "selected" : ""}"
             onclick="selectMsg('${m.id}')">

          <b>${m.name}</b>
          <span class="small">${m.email}</span>

          <p>${m.text}</p>

          ${m.reply ? `<div style="color:#00ff88">↳ ${m.reply}</div>` : ""}
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

  if (badWords.some(w => text.includes(w))) {
    alert("⛔ Message bloqué (insulte)");
    return;
  }

  const { error } = await supabase.from("messages").insert([{
    name: nameInput.value,
    email: emailInput.value,
    text: textInput.value,
    reply: "",
    blocked: false
  }]);

  if (error) {
    console.log("INSERT ERROR:", error);
    return;
  }

  form.reset();
  loadMessages();
});

// ======================
// SELECT MESSAGE
// ======================
window.selectMsg = function(id) {

  const msg = messages.find(m => m.id === id);
  if (!msg) return;

  selectedId = id;

  selectedDiv.innerHTML = `
    <b>${msg.name}</b><br>
    ${msg.text}
  `;
};

// ======================
// LOGIN ADMIN
// ======================
window.login = function() {

  if (passInput.value === "admin123") {
    isAdmin = true;
    adminPanel.style.display = "block";
    alert("Admin connecté");
  }
};

// ======================
// REPLY
// ======================
window.reply = async function() {

  if (!selectedId) return;

  await supabase
    .from("messages")
    .update({ reply: replyInput.value })
    .eq("id", selectedId);

  replyInput.value = "";
  loadMessages();
};

// ======================
// BAN CORE
// ======================
async function banMessage(id) {

  await supabase
    .from("messages")
    .update({ blocked: true })
    .eq("id", id);

  alert("🚫 Message banni");
  loadMessages();
}

// ======================
// BAN SELECTED BUTTON
// ======================
window.banSelected = async function() {

  if (!selectedId) {
    alert("Aucun message sélectionné");
    return;
  }

  banMessage(selectedId);
};

// ======================
// ADMIN COMMANDS
// ======================
window.runCmd = async function() {

  const c = cmdInput.value.split(" ");

  if (c[0] === "ban") {
    banMessage(c[1]);
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
