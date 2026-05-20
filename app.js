async function loadSettings(){

  console.log("📡 LOAD SETTINGS...");

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  console.log("📦 DATA SETTINGS:", data);
  console.log("❌ ERROR:", error);

  if (error || !data) {
    console.log("🚨 SETTINGS ERROR");
    return;
  }

  maintenance = data.maintenance;

  console.log("🛠️ MAINTENANCE =", maintenance);

  if (maintenance === true) {

    console.log("🚨 MAINTENANCE ACTIVE");

    document.body.innerHTML = `
      <div style="
        background:black;
        color:white;
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        flex-direction:column;
        font-family:Arial;
      ">
        <h1>🛠️ Maintenance</h1>
        <p>Site temporairement fermé</p>
      </div>
    `;

    return;
  }

  console.log("🟢 SITE NORMAL");
}
