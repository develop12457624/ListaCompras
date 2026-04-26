import test from "node:test";
import assert from "node:assert/strict";
import {
  agruparPorCategoria,
  calcularResumen,
  crearArticulo,
  validarArticulo,
} from "../src/listaCompras.js";

test("Kata TDD 1: valida un articulo real de mercado", () => {
  const resultado = validarArticulo({
    nombre: "Tomates cherry",
    categoria: "frutas",
  });

  assert.equal(resultado.valido, true);
  assert.deepEqual(resultado.errores, []);
});

test("Kata TDD 2: rechaza un articulo sin nombre", () => {
  const resultado = validarArticulo({
    nombre: "   ",
    categoria: "despensa",
  });

  assert.equal(resultado.valido, false);
  assert.deepEqual(resultado.errores, ["El articulo debe tener nombre"]);
});

test("Kata TDD 3: crea un articulo normalizado para la lista", () => {
  const articulo = crearArticulo({
    id: "mercado-001",
    nombre: "  Pan   integral  ",
    categoria: "pan",
    creadoEn: "2026-04-26T10:00:00.000Z",
  });

  assert.deepEqual(articulo, {
    id: "mercado-001",
    nombre: "Pan integral",
    categoria: "pan",
    comprado: false,
    creadoEn: "2026-04-26T10:00:00.000Z",
  });
});

test("Kata TDD 4: agrupa articulos por seccion del supermercado", () => {
  const articulos = [
    crearArticulo({
      id: "mercado-002",
      nombre: "Yogur natural",
      categoria: "lacteos",
      creadoEn: "2026-04-26T10:05:00.000Z",
    }),
    crearArticulo({
      id: "mercado-003",
      nombre: "Detergente liquido",
      categoria: "limpieza",
      creadoEn: "2026-04-26T10:06:00.000Z",
    }),
  ];

  const grupos = agruparPorCategoria(articulos);

  assert.equal(grupos.lacteos[0].nombre, "Yogur natural");
  assert.equal(grupos.limpieza[0].nombre, "Detergente liquido");
  assert.equal(grupos.frutas.length, 0);
});

test("Kata TDD 5: calcula pendientes y comprados", () => {
  const articulos = [
    crearArticulo({
      id: "mercado-004",
      nombre: "Cafe molido",
      categoria: "despensa",
      comprado: true,
      creadoEn: "2026-04-26T10:10:00.000Z",
    }),
    crearArticulo({
      id: "mercado-005",
      nombre: "Jugo de naranja",
      categoria: "bebidas",
      creadoEn: "2026-04-26T10:11:00.000Z",
    }),
  ];

  assert.deepEqual(calcularResumen(articulos), {
    total: 2,
    pendientes: 1,
    comprados: 1,
    texto: "1 pendiente - 1 comprado",
  });
});
