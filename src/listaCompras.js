export const CATEGORIAS = [
  "frutas",
  "lacteos",
  "carnes",
  "pan",
  "despensa",
  "bebidas",
  "limpieza",
  "otros",
];

export const ETIQUETAS_CATEGORIA = {
  frutas: "Frutas y verduras",
  lacteos: "Lacteos",
  carnes: "Carnes y pescado",
  pan: "Panaderia",
  despensa: "Despensa",
  bebidas: "Bebidas",
  limpieza: "Limpieza e higiene",
  otros: "Otros",
};

export function normalizarNombre(nombre) {
  return String(nombre ?? "").trim().replace(/\s+/g, " ");
}

export function validarArticulo(articulo) {
  const errores = [];
  const nombre = normalizarNombre(articulo?.nombre);

  if (!nombre) {
    errores.push("El articulo debe tener nombre");
  }

  if (nombre.length > 120) {
    errores.push("El articulo no debe superar 120 caracteres");
  }

  if (!CATEGORIAS.includes(articulo?.categoria)) {
    errores.push("La categoria no existe");
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

export function crearArticulo({
  id,
  nombre,
  categoria,
  comprado = false,
  creadoEn = new Date().toISOString(),
}) {
  const articulo = {
    id,
    nombre: normalizarNombre(nombre),
    categoria,
    comprado: Boolean(comprado),
    creadoEn,
  };
  const validacion = validarArticulo(articulo);

  if (!validacion.valido) {
    throw new Error(validacion.errores.join(". "));
  }

  return articulo;
}

export function agruparPorCategoria(articulos) {
  const grupos = Object.fromEntries(CATEGORIAS.map((categoria) => [categoria, []]));

  for (const articulo of articulos) {
    const categoria = CATEGORIAS.includes(articulo.categoria) ? articulo.categoria : "otros";
    grupos[categoria].push(articulo);
  }

  return grupos;
}

export function calcularResumen(articulos) {
  const comprados = articulos.filter((articulo) => articulo.comprado).length;
  const pendientes = articulos.length - comprados;

  if (articulos.length === 0) {
    return {
      total: 0,
      pendientes: 0,
      comprados: 0,
      texto: "",
    };
  }

  if (pendientes === 0) {
    return {
      total: articulos.length,
      pendientes,
      comprados,
      texto: `Todo listo: ${comprados} ${comprados === 1 ? "articulo comprado" : "articulos comprados"}.`,
    };
  }

  return {
    total: articulos.length,
    pendientes,
    comprados,
    texto: `${pendientes} ${pendientes === 1 ? "pendiente" : "pendientes"}${comprados > 0 ? ` - ${comprados} ${comprados === 1 ? "comprado" : "comprados"}` : ""}`,
  };
}
