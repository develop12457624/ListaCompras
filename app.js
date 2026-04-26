import {
  CATEGORIAS,
  ETIQUETAS_CATEGORIA,
  agruparPorCategoria,
  calcularResumen,
} from "./src/listaCompras.js";

const formulario = document.getElementById("form-add");
const entradaArticulo = document.getElementById("input-item");
const selectorCategoria = document.getElementById("select-cat");
const contenedorListas = document.getElementById("lists");
const mensajeVacio = document.getElementById("empty");
const resumenVista = document.getElementById("stats");
const botonVaciar = document.getElementById("btn-clear");

let articulos = [];

async function cargarArticulos() {
  const respuesta = await fetch("/api/articulos");
  articulos = await respuesta.json();
  renderizar();
}

async function guardarArticulo(nombre, categoria) {
  const respuesta = await fetch("/api/articulos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, categoria }),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo guardar el articulo");
  }

  articulos.push(await respuesta.json());
  renderizar();
}

async function actualizarCompra(articulo, comprado) {
  const respuesta = await fetch(`/api/articulos/${articulo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comprado }),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo actualizar el articulo");
  }

  const articuloActualizado = await respuesta.json();
  articulos = articulos.map((actual) => (actual.id === articulo.id ? articuloActualizado : actual));
  renderizar();
}

async function quitarArticulo(id) {
  const respuesta = await fetch(`/api/articulos/${id}`, { method: "DELETE" });

  if (!respuesta.ok) {
    throw new Error("No se pudo quitar el articulo");
  }

  articulos = articulos.filter((articulo) => articulo.id !== id);
  renderizar();
}

async function vaciarComprados() {
  const respuesta = await fetch("/api/articulos-comprados", { method: "DELETE" });

  if (!respuesta.ok) {
    throw new Error("No se pudo vaciar la lista");
  }

  articulos = articulos.filter((articulo) => !articulo.comprado);
  renderizar();
}

function renderizar() {
  contenedorListas.innerHTML = "";

  const grupos = agruparPorCategoria(articulos);
  const resumen = calcularResumen(articulos);
  const hayArticulos = articulos.length > 0;

  mensajeVacio.hidden = hayArticulos;
  resumenVista.textContent = resumen.texto;
  botonVaciar.hidden = resumen.comprados === 0;

  if (!hayArticulos) {
    return;
  }

  for (const categoria of CATEGORIAS) {
    const grupo = grupos[categoria];

    if (grupo.length === 0) {
      continue;
    }

    const seccion = document.createElement("section");
    seccion.className = "section";
    seccion.dataset.category = categoria;
    seccion.setAttribute("aria-label", ETIQUETAS_CATEGORIA[categoria]);

    const titulo = document.createElement("h2");
    titulo.className = "section-title";
    titulo.textContent = ETIQUETAS_CATEGORIA[categoria];
    seccion.appendChild(titulo);

    for (const articulo of grupo) {
      const fila = document.createElement("div");
      fila.className = `item${articulo.comprado ? " done" : ""}`;
      fila.dataset.id = articulo.id;

      const etiqueta = document.createElement("label");
      etiqueta.className = "item-label";

      const casilla = document.createElement("input");
      casilla.type = "checkbox";
      casilla.checked = articulo.comprado;
      casilla.addEventListener("change", () => {
        actualizarCompra(articulo, casilla.checked).catch(mostrarError);
      });

      const texto = document.createElement("span");
      texto.className = "item-text";
      texto.textContent = articulo.nombre;

      etiqueta.appendChild(casilla);
      etiqueta.appendChild(texto);

      const botonQuitar = document.createElement("button");
      botonQuitar.type = "button";
      botonQuitar.className = "btn-remove";
      botonQuitar.setAttribute("aria-label", "Quitar de la lista");
      botonQuitar.textContent = "x";
      botonQuitar.addEventListener("click", () => {
        quitarArticulo(articulo.id).catch(mostrarError);
      });

      fila.appendChild(etiqueta);
      fila.appendChild(botonQuitar);
      seccion.appendChild(fila);
    }

    contenedorListas.appendChild(seccion);
  }
}

function mostrarError(error) {
  resumenVista.textContent = error.message;
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const nombre = entradaArticulo.value.trim();

  if (!nombre) {
    return;
  }

  guardarArticulo(nombre, selectorCategoria.value)
    .then(() => {
      entradaArticulo.value = "";
      entradaArticulo.focus();
    })
    .catch(mostrarError);
});

botonVaciar.addEventListener("click", () => {
  vaciarComprados().catch(mostrarError);
});

cargarArticulos()
  .then(() => entradaArticulo.focus())
  .catch(mostrarError);
