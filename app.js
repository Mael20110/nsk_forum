let messages = JSON.parse(localStorage.getItem("messages")) || [];
let selected = null;

const badWords = ["merde","putain"]; // modération simple

function save(){
  localStorage.setItem("messages", JSON.stringify(messages));
}

function time(){
  return new Date().toLocaleString();
}

// render
function render(){
  const box = document.getElementById("messages");
  const search = document.getElementById("search")?.value?.toLowerCase() || "";

  box.innerHTML = "";

  messages
  .filter(m => m.text.toLowerCase().includes(search))
  .forEach((m,i)=>{

    box.innerHTML += `
      <div class="message ${selected===i?'selected':''}" onclick="selectMsg(${i})">
        <b>${m.name}</b>
        <span class="small">${m.email}</span>
        <p>${m.text}</p>

        <span class="small">${m.time}</span>

        ${m.reply ? `<div class="reply">↳ ${m.reply}</div>` : ""}
      </div>
    `;
  });
}

// add message
document.getElementById("contactForm").addEventListener("submit",e=>{
  e.preventDefault();

  let text = message.value.toLowerCase();

  if(badWords.some(w=>text.includes(w))){
    alert("Message bloqué (mots interdits)");
    return;
  }

  messages.push({
    name:name.value,
    email:email.value,
    text:message.value,
    reply:"",
    time:time()
  });

  save();
  render();
  e.target.reset();
});

// select message
function selectMsg(i){
  selected = i;
  document.getElementById("selectedMsg").innerText = messages[i].text;
  render();
}

// admin login
function loginAdmin(){
  if(adminPass.value === "admin123"){
    adminPanel.style.display="block";
  }else alert("Erreur");
}

// reply
function reply(){
  if(selected===null) return;

  messages[selected].reply = replyText.value;
  save();
  render();
}

// commands
function runCmd(){
  let c = cmd.value.split(" ");

  if(c[0]==="delete"){
    messages.splice(c[1],1);
  }

  if(c[0]==="clear"){
    messages = [];
  }

  if(c[0]==="ban"){
    badWords.push(c[1]);
    alert("Mot banni ajouté");
  }

  save();
  render();
}

// export data
function exportData(){
  const data = JSON.stringify(messages);
  navigator.clipboard.writeText(data);
  alert("Copié JSON !");
}

// reset
function resetAll(){
  if(confirm("Tout supprimer ?")){
    messages = [];
    save();
    render();
  }
}

// search live
document.getElementById("search").addEventListener("input",render);

render();
