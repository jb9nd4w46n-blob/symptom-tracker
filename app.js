// --- Datenbank im Speicher -------------------------

let db = {
  products: [],        // { id, name, brand, category, ingredients: [string] }
  symptoms: [],        // { id, name }
  usages: [],          // { id, date, productId }
  symptomEntries: []   // { id, date, symptomId, intensity }
};

// --- Laden/Speichern in localStorage ----------------

const DB_KEY = "cosmeticTrackerDb_v1";

function loadDb() {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      db = JSON.parse(stored);
    } catch (e) {
      console.error("Konnte gespeicherte Daten nicht lesen:", e);
    }
  }
}

function saveDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// --- Hilfsfunktionen -------------------------------

function byId(id) {
  return document.getElementById(id);
}

function setToday(dateInput) {
  const today = new Date();
  const tzOffset = today.getTimezoneOffset() * 60000;
  const localISODate = new Date(today - tzOffset).toISOString().slice(0, 10);
  dateInput.value = localISODate;
}

// --- Rendering-Funktionen --------------------------

const productListEl = byId("product-list");
const productDetailEl = byId("product-detail");
const detailNameEl = byId("detail-name");
const detailBrandEl = byId("detail-brand");
const detailCategoryEl = byId("detail-category");
const detailIngredientsEl = byId("detail-ingredients");
const usageProductSelect = byId("usage-product");

const symptomListEl = byId("symptom-list");
const symptomSelectEl = byId("symptom-select");

const usageListEl = byId("usage-list");
const symptomEntryListEl = byId("symptom-entry-list");
const trackingDateInput = byId("tracking-date");

// Produkte anzeigen + Select für Usage füllen
function renderProducts() {
  productListEl.innerHTML = "";
  usageProductSelect.innerHTML = "";

  db.products.forEach(product => {
    // Liste
    const li = document.createElement("li");
    li.classList.add("clickable");
    li.textContent = `${product.name} ${product.brand ? "(" + product.brand + ")" : ""}`;
    li.addEventListener("click", () => showProductDetail(product.id));
    productListEl.appendChild(li);

    // Select
    const opt = document.createElement("option");
    opt.value = String(product.id);
    opt.textContent = product.name;
    usageProductSelect.appendChild(opt);
  });

  if (db.products.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Noch keine Produkte angelegt.";
    productListEl.appendChild(li);

    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Keine Produkte verfügbar";
    usageProductSelect.appendChild(opt);
  }
}

// Produktdetails anzeigen
function showProductDetail(productId) {
  const product = db.products.find(p => p.id === productId);
  if (!product) return;

  detailNameEl.textContent = product.name;
  detailBrandEl.textContent = product.brand || "—";
  detailCategoryEl.textContent = product.category || "—";

  detailIngredientsEl.innerHTML = "";
  if (product.ingredients && product.ingredients.length > 0) {
    product.ingredients.forEach(ing => {
      const li = document.createElement("li");
      li.textContent = ing;
      detailIngredientsEl.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "Keine Inhaltsstoffe hinterlegt.";
    detailIngredientsEl.appendChild(li);
  }

  productDetailEl.classList.remove("hidden");
}

// Symptome anzeigen + Select füllen
function renderSymptoms() {
  symptomListEl.innerHTML = "";
  symptomSelectEl.innerHTML = "";

  db.symptoms.forEach(symptom => {
    const li = document.createElement("li");
    li.textContent = symptom.name;
    symptomListEl.appendChild(li);

    const opt = document.createElement("option");
    opt.value = String(symptom.id);
    opt.textContent = symptom.name;
    symptomSelectEl.appendChild(opt);
  });

  if (db.symptoms.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Noch keine Symptome angelegt.";
    symptomListEl.appendChild(li);

    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Keine Symptome verfügbar";
    symptomSelectEl.appendChild(opt);
  }
}

// Usages + SymptomEntries für ein Datum anzeigen
function renderForDate(dateStr) {
  // Usages
  usageListEl.innerHTML = "";
  const usages = db.usages.filter(u => u.date === dateStr);

  if (usages.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Keine Produkte an diesem Tag erfasst.";
    usageListEl.appendChild(li);
  } else {
    usages.forEach(u => {
      const product = db.products.find(p => p.id === u.productId);
      const li = document.createElement("li");
      li.textContent = product ? product.name : "Unbekanntes Produkt";
      usageListEl.appendChild(li);
    });
  }

  // SymptomEntries
  symptomEntryListEl.innerHTML = "";
  const entries = db.symptomEntries.filter(e => e.date === dateStr);

  if (entries.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Keine Symptome an diesem Tag erfasst.";
    symptomEntryListEl.appendChild(li);
  } else {
    entries.forEach(e => {
      const symptom = db.symptoms.find(s => s.id === e.symptomId);
      const li = document.createElement("li");
      li.textContent = `${symptom ? symptom.name : "Unbekanntes Symptom"}: Intensität ${e.intensity}`;
      symptomEntryListEl.appendChild(li);
    });
  }
}

// --- Event-Handler ----------------------------------

// Produkt-Formular
byId("product-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = byId("product-name").value.trim();
  const brand = byId("product-brand").value.trim();
  const category = byId("product-category").value.trim();
  const ingredientsText = byId("product-ingredients").value.trim();

  if (!name) return;

  const ingredients = ingredientsText
    ? ingredientsText.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const newProduct = {
    id: Date.now(),
    name,
    brand,
    category,
    ingredients
  };

  db.products.push(newProduct);
  saveDb();

  byId("product-form").reset();
  renderProducts();
});

// Symptom-Formular
byId("symptom-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = byId("symptom-name").value.trim();
  if (!name) return;

  const newSymptom = {
    id: Date.now(),
    name
  };

  db.symptoms.push(newSymptom);
  saveDb();

  byId("symptom-form").reset();
  renderSymptoms();
});

// Datum geändert
trackingDateInput.addEventListener("change", () => {
  renderForDate(trackingDateInput.value);
});

// Usage hinzufügen
byId("usage-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const dateStr = trackingDateInput.value;
  const productIdStr = usageProductSelect.value;
  if (!dateStr || !productIdStr) return;

  const productId = Number(productIdStr);
  if (!db.products.find(p => p.id === productId)) return;

  const newUsage = {
    id: Date.now(),
    date: dateStr,
    productId
  };

  db.usages.push(newUsage);
  saveDb();
  renderForDate(dateStr);
});

// SymptomEntry hinzufügen
byId("symptom-entry-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const dateStr = trackingDateInput.value;
  const symptomIdStr = symptomSelectEl.value;
  const intensityStr = byId("symptom-intensity").value;

  if (!dateStr || !symptomIdStr) return;

  const symptomId = Number(symptomIdStr);
  const intensity = Number(intensityStr);
  if (Number.isNaN(intensity)) return;

  const newEntry = {
    id: Date.now(),
    date: dateStr,
    symptomId,
    intensity
  };

  db.symptomEntries.push(newEntry);
  saveDb();
  byId("symptom-entry-form").reset();
  renderForDate(dateStr);
});

// Export-Button – JSON-Datei herunterladen
byId("export-button").addEventListener("click", () => {
  try {
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const today = new Date().toISOString().slice(0, 10); // z.B. 2026-05-16
    a.href = url;
    a.download = `cosmetic-tracker-${today}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Export fehlgeschlagen:", e);
    alert("Export fehlgeschlagen. Details in der Konsole.");
  }
});

// Reset-Button
byId("reset-button").addEventListener("click", () => {
  if (!confirm("Wirklich alle lokal gespeicherten Daten löschen?")) return;
  db = {
    products: [],
    symptoms: [],
    usages: [],
    symptomEntries: []
  };
  saveDb();
  renderProducts();
  renderSymptoms();
  renderForDate(trackingDateInput.value);
});

// --- Initialisierung --------------------------------

loadDb();
setToday(trackingDateInput);
renderProducts();
renderSymptoms();
renderForDate(trackingDateInput.value);
