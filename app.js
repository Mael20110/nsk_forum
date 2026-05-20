console.log("🔥 APP.JS CHARGÉ");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ======================
// CONFIG
// ======================
let maintenance = false;

const supabase = createClient(
  "https://hchrmmvmkdqqhknfytwi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjaHJtbXZta2RxcWhrbmZ5dHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzM3NzQsImV4cCI6MjA5NDg0OTc3NH0.xrIR3ItK7rPynUXmTFj9EqtN-1WW7LboyI2nAfas57I"
);

// ======================
// STATE
// ======================
let selectedId = null;
let isAdmin = false;
let messages = [];
let lastSend = 0;

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
// MAINTENANCE MODE
// ======================
function checkMaintenance() {
  if (!maintenance) return false;

  document.body.innerHTML = `
    <div class="maintenance">
      <h1>🛠️ Maintenance en cours</h1>
      <p>Le site est temporairement fermé</p>
      <div class="ribbons"></div>
    </div>
  `;

  return true;
}

// ======================
// LOAD MESSAGES
// ======================
async function loadMessages() {

  if (checkMaintenance()) return;

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

  const searchVal = searchInput.value?.toLowerCase() || "";

  messagesDiv.innerHTML = "";

  const filtered = messages
    .filter(m => m.text?.toLowerCase().includes(searchVal))
    .filter(m => !m.blocked); // 🚀 anti-banned messages

  filtered.forEach(m => {

    messagesDiv.innerHTML += `
      <div class="msg ${selectedId === m.id ? "selected" : ""}"
           onclick="selectMsg('${m.id}')">

        ${isAdmin ? `<div class="admin-check">${selectedId === m.id ? "☑️" : "⬜"}</div>` : ""}

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

  const now = Date.now();

  // ⛔ anti spam
  if (now - lastSend < 5000) {
    alert("⛔ Attends avant de renvoyer un message");
    return;
  }

  lastSend = now;

  // ⛔ filtre
  const text = textInput.value.toLowerCase();
  const badWords = ["merde", "putain", "fuck"];

  if (badWords.some(w => text.includes(w))) {
    alert("⛔ Message bloqué");
    return;
  }

  const { error } = await supabase
    .from("messages")
    .insert([
      {
        name: nameInput.value,
        email: emailInput.value,
        text: textInput.value,
        reply: "",
        blocked: false
      }
    ]);

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
window.selectMsg = function (id) {

  const msg = messages.find(m => m.id === id);

  if (!msg) return;

  selectedId = id;
  selectedDiv.innerText = msg.text;
};

// ======================
// LOGIN ADMIN
// ======================
window.login = function () {

  if (passInput.value.trim() === "admin123") {
    isAdmin = true;
    adminPanel.style.display = "block";
    alert("Admin connecté");
  } else {
    alert("Mot de passe incorrect");
  }
};

// ======================
// REPLY
// ======================
window.reply = async function () {

  if (!selectedId) return;

  const { error } = await supabase
    .from("messages")
    .update({ reply: replyInput.value })
    .eq("id", selectedId);

  if (error) {
    console.log(error);
    return;
  }

  replyInput.value = "";
  loadMessages();
};

// ======================
// COMMANDS
// ======================
window.runCmd = function () {

  const c = cmdInput.value.split(" ");

  if (c[0] === "block") {
    supabase.from("messages")
      .update({ blocked: true })
      .eq("id", c[1]);
  }

  if (c[0] === "delete") {
    supabase.from("messages").delete().eq("id", c[1]);
  }

  if (c[0] === "clear") {
    supabase.from("messages").delete().neq("id", "x");
  }

  cmdInput.value = "";
  loadMessages();
};

// ======================
// LIVE UPDATE
// ======================
setInterval(loadMessages, 2000);

// ======================
// SEARCH
// ======================
searchInput.addEventListener("input", render);

// ======================
// INIT
// ======================
loadMessages();
