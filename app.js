console.log("App gestartet");

// kleiner Test mit localStorage
if (typeof(Storage) !== "undefined") {
  localStorage.setItem("testKey", "Hallo localStorage!");
  console.log("localStorage test:", localStorage.getItem("testKey"));
} else {
  console.log("Kein Web Storage Support");
}