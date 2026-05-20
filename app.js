const form = document.getElementById("contactForm");

form.addEventListener("submit", function(e){

  e.preventDefault();

  const message =
    document.getElementById("message").value;

  if(message.length < 20){
    alert("Minimum 20 caractères");
    return;
  }

  alert("Message envoyé !");
});
