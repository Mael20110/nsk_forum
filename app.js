import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ======================
// SUPABASE (TES IDS)
// ======================
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

// ======================
// ELEMENTS (TES IDS HTML)
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

  const searchVal = searchInput.value?.toLowerCase() || "";

  messagesDiv.innerHTML = "";

  messages
    .filter(m => m.text.toLowerCase().includes(searchVal))
    .forEach(m => {

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

  const { error } = await supabase
    .from("messages")
    .insert([
      {
        name: nameInput.value,
        email: emailInput.value,
        text: textInput.value,
        reply: ""
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
// ADMIN LOGIN
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
    console.log("REPLY ERROR:", error);
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
