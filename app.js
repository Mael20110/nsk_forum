let messages = JSON.parse(localStorage.getItem("msgs")) || [];
let selectedId = null;
let isAdmin = false;

const badWords = ["merde","putain","fuck"];

// SAVE
function save(){
  localStorage.setItem("msgs", JSON.stringify(messages));
}

// ID
function uid(){
  return Date.now() + Math.random();
}

// RENDER
function render(){
  const box = document.getElementById("messages");
  const searchVal = search.value?.toLowerCase() || "";

  box.innerHTML = "";

  messages
    .filter(m => m.text.toLowerCase().includes(searchVal))
    .forEach(m => {

      box.innerHTML += `
        <div class="msg ${selectedId===m.id?'selected':''}">

          ${isAdmin ? `
            <div class="admin-check" onclick="selectMsg('${m.id}')">
              ${selectedId===m.id ? "☑️" : "⬜"}
            </div>
          ` : ""}

          <b>${m.name}</b>
          <span class="small">${m.email}</span>

          <p>${m.text}</p>

          <span class="small">${m.time}</span>

          ${m.reply ? `<div class="reply">↳ ${m.reply}</div>` : ""}
        </div>
      `;
    });
}

// SEND MESSAGE
form.addEventListener("submit", e=>{
  e.preventDefault();

  if(badWords.some(w=>text.value.toLowerCase().includes(w))){
    alert("Message bloqué");
    return;
  }

  messages.push({
    id: uid(),
    name: name.value,
    email: email.value,
    text: text.value,
    reply: "",
    time: new Date().toLocaleString()
  });

  save();
  render();
  form.reset();
});

// SELECT MESSAGE (ADMIN)
function selectMsg(id){

  if(selectedId === id){
    selectedId = null;
    selected.innerText = "Aucun";
  } else {
    selectedId = id;
    let msg = messages.find(m=>m.id===id);
    selected.innerText = msg.text;
  }

  render();
}

// ADMIN LOGIN
function login(){
  if(pass.value === "admin123"){
    admin.style.display = "block";
    isAdmin = true;
    render();
  }
}

// REPLY
function reply(){
  let msg = messages.find(m=>m.id===selectedId);
  if(!msg) return;

  msg.reply = reply.value;

  save();
  render();
}

// COMMANDS
function runCmd(){
  let c = cmd.value.split(" ");

  if(c[0]==="delete"){
    messages = messages.filter(m=>m.id != c[1]);
  }

  if(c[0]==="clear"){
    messages = [];
  }

  if(c[0]==="ban"){
    badWords.push(c[1]);
  }

  save();
  render();
}

// AUTO UPDATE LIVE
setInterval(()=>{
  let newData = JSON.parse(localStorage.getItem("msgs")) || [];

  if(JSON.stringify(newData) !== JSON.stringify(messages)){
    messages = newData;
    render();
  }
},800);

// SEARCH
search.addEventListener("input", render);

render();
render();
