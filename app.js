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
  "Hitler,
  "hitler",
  "fdp",
  "merde",
  "putain",
  "connard",
  "connasse",
  "salope",
  "pute",
  "enculé",
  "encule",
  "batard",
  "bâtard",
  "fdp",
  "fils de pute",
  "nique",
  "nique ta mère",
  "ntm",
  "tg",
  "ta gueule",
  "fuck",
  "shit",
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
  "hitler",
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

          <b>${m.name || "Anonyme"}</b>
          <span class="small">${m.email || ""}</span>

          <p>${m.text || ""}</p>

          ${m.reply
            ? `<div style="color:#00ff88">↳ ${m.reply}</div>`
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

  // BAD WORDS
  if (badWords.some(w => text.includes(w))) {
    alert("⛔ Message bloqué (insulte)");
    return;
  }

  const { error } = await supabase
    .from("messages")
    .insert([{
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
async function banMessage(id) {

  await supabase
    .from("messages")
    .update({
      blocked: true
    })
    .eq("id", id);

  alert("🚫 Message banni");

  loadMessages();
}

// ======================
// COMMANDS
// ======================
window.runCmd = async function() {

  const c = cmdInput.value.split(" ");

  if (c[0] === "ban") {
    banMessage(c[1]);
  }

  cmdInput.value = "";
};

// ======================
// BAN SELECTED
// ======================
window.banSelected = async function() {

  if (!selectedId) {
    alert("Aucun message sélectionné");
    return;
  }

  banMessage(selectedId);
};

// ======================
// INIT
// ======================
loadMessages();

setInterval(loadMessages, 2000);
