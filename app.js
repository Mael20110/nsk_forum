const form = document.getElementById("contactForm");
const status = document.getElementById("status");

// mots interdits
const bannedWords = ["spam", "hack", "arnaque", "insulte"];

// envoyer message
form.addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  // règle longueur minimum
  if(message.length < 20){
    status.innerText = "❌ Minimum 20 caractères";
    return;
  }

  // filtre mots interdits
  if(bannedWords.some(word => message.toLowerCase().includes(word))){
    status.innerText = "❌ Message refusé (mot interdit)";
    return;
  }

  // objet message
  const newMessage = {
    name,
    email,
    message,
    date: new Date().toLocaleString(),
    response: ""
  };

  // récupérer messages existants
  let messages = JSON.parse(localStorage.getItem("messages")) || [];

  messages.push(newMessage);

  localStorage.setItem("messages", JSON.stringify(messages));

  status.innerText = "✅ Message envoyé !";

  form.reset();
});
