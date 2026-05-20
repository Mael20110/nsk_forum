let messages = JSON.parse(localStorage.getItem("messages")) || [];

function renderMessages(){
  const container = document.getElementById("messages");
  container.innerHTML = "";

  messages.forEach((msg, index) => {
    container.innerHTML += `
      <div class="message">
        <b>${msg.name}</b> <br>
        <span class="small">${msg.email}</span>
        <p>${msg.text}</p>

        <span class="status ${msg.status}">
          ${msg.status}
        </span>
      </div>
    `;
  });
}

document.getElementById("contactForm").addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  messages.push({
    name,
    email,
    text: message,
    status: "pending"
  });

  localStorage.setItem("messages", JSON.stringify(messages));

  document.getElementById("status").innerText = "Message envoyé ✔️";

  this.reset();
  renderMessages();
});

function loginAdmin(){
  const pass = document.getElementById("adminPass").value;

  if(pass === "admin123"){
    document.getElementById("adminPanel").style.display = "block";
    alert("Admin connecté");
  } else {
    alert("Mot de passe incorrect");
  }
}

function replyMessage(){
  if(messages.length === 0) return;

  messages[messages.length - 1].status = "answered";

  localStorage.setItem("messages", JSON.stringify(messages));
  renderMessages();

  alert("Réponse envoyée");
}

renderMessages();
