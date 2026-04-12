const STORAGE_KEY = "lista-compras-feature-b";

const CATEGORY_LABELS = {
  frutas: "Frutas y verduras",
  lacteos: "Lácteos",
  carnes: "Carnes y pescado",
  pan: "Panadería",
  despensa: "Despensa",
  bebidas: "Bebidas",
  limpieza: "Limpieza e higiene",
  otros: "Otros",
};

const CATEGORY_ORDER = [
  "frutas",
  "lacteos",
  "carnes",
  "pan",
  "despensa",
  "bebidas",
  "limpieza",
  "otros",
];

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const form = document.getElementById("form-add");
const inputItem = document.getElementById("input-item");
const selectCat = document.getElementById("select-cat");
const listsEl = document.getElementById("lists");
const emptyEl = document.getElementById("empty");
const statsEl = document.getElementById("stats");
const btnClear = document.getElementById("btn-clear");

let items = loadItems();

function render() {
  listsEl.innerHTML = "";

  const byCat = {};
  for (const key of CATEGORY_ORDER) {
    byCat[key] = [];
  }
  for (const item of items) {
    const cat = CATEGORY_ORDER.includes(item.category) ? item.category : "otros";
    byCat[cat].push(item);
  }

  const hasAny = items.length > 0;
  emptyEl.hidden = hasAny;

  let pending = 0;
  let done = 0;
  for (const item of items) {
    if (item.done) done += 1;
    else pending += 1;
  }

  if (!hasAny) {
    statsEl.textContent = "";
    btnClear.hidden = true;
    return;
  }

  statsEl.textContent =
    pending === 0 && done > 0
      ? `Todo listo: ${done} artículo${done === 1 ? "" : "s"} comprado${done === 1 ? "" : "s"}.`
      : pending > 0
        ? `${pending} pendiente${pending === 1 ? "" : "s"}${done > 0 ? ` · ${done} comprado${done === 1 ? "" : "s"}` : ""}`
        : `${items.length} artículo${items.length === 1 ? "" : "s"}`;

  btnClear.hidden = done === 0;

  for (const cat of CATEGORY_ORDER) {
    const group = byCat[cat];
    if (group.length === 0) continue;

    const section = document.createElement("section");
    section.className = "section";
    section.dataset.category = cat;
    section.setAttribute("aria-label", CATEGORY_LABELS[cat]);

    const h2 = document.createElement("h2");
    h2.className = "section-title";
    h2.textContent = CATEGORY_LABELS[cat];
    section.appendChild(h2);

    for (const item of group) {
      const row = document.createElement("div");
      row.className = "item" + (item.done ? " done" : "");
      row.dataset.id = item.id;

      const label = document.createElement("label");
      label.className = "item-label";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = item.done;
      cb.addEventListener("change", () => {
        item.done = cb.checked;
        saveItems(items);
        render();
      });

      const span = document.createElement("span");
      span.className = "item-text";
      span.textContent = item.text;

      label.appendChild(cb);
      label.appendChild(span);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn-remove";
      remove.setAttribute("aria-label", "Quitar de la lista");
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        items = items.filter((x) => x.id !== item.id);
        saveItems(items);
        render();
      });

      row.appendChild(label);
      row.appendChild(remove);
      section.appendChild(row);
    }

    listsEl.appendChild(section);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputItem.value.trim();
  if (!text) return;

  items.push({
    id: uid(),
    text,
    category: selectCat.value,
    done: false,
  });
  saveItems(items);
  inputItem.value = "";
  inputItem.focus();
  render();
});

btnClear.addEventListener("click", () => {
  items = items.filter((x) => !x.done);
  saveItems(items);
  render();
});

render();
inputItem.focus();
