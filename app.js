const form = document.getElementById("contactForm");
const status = document.getElementById("status");

// mots interdits
const bannedWords = ["spam", "hack", "arnaque", "insulte"];

// anti-spam simple (limite temps)
let lastSend = 0;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const now = Date.now();
  if (now - lastSend < 10000) {
    status.innerText = "⛔ Attends quelques secondes avant de renvoyer un message.";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  // longueur minimum
  if (message.length < 20) {
    status.innerText = "❌ Minimum 20 caractères.";
    return;
  }

  // mots interdits
  if (bannedWords.some(word => message.toLowerCase().includes(word))) {
    status.innerText = "❌ Message refusé (mot interdit).";
    return;
  }

  const newMessage = {
    name,
    email,
    message,
    date: new Date().toLocaleString(),
    response: "",
    status: "pending"
  };

  let messages = JSON.parse(localStorage.getItem("messages")) || [];
  messages.push(newMessage);

  localStorage.setItem("messages", JSON.stringify(messages));

  lastSend = now;

  status.innerText = "✅ Message envoyé !";
  form.reset();
});
