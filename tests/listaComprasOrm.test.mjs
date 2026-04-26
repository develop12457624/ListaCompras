import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { ListaComprasOrm } from "../src/listaComprasOrm.js";

test("ORM: crea, lista, actualiza y elimina articulos en la base de datos", async () => {
  const carpetaPrueba = await mkdtemp(join(process.cwd(), "datos", "prueba-orm-"));
  const rutaBaseDatos = join(carpetaPrueba, "compras-casa.bd.json");
  const orm = new ListaComprasOrm(rutaBaseDatos);

  try {
    const arroz = await orm.crearArticulo({
      nombre: "Arroz extra",
      categoria: "despensa",
      creadoEn: "2026-04-26T11:00:00.000Z",
    });
    const queso = await orm.crearArticulo({
      nombre: "Queso fresco",
      categoria: "lacteos",
      creadoEn: "2026-04-26T11:01:00.000Z",
    });

    assert.equal(arroz.id, "1");
    assert.equal(queso.id, "2");

    const articulosIniciales = await orm.listarArticulos();
    assert.deepEqual(
      articulosIniciales.map((articulo) => articulo.nombre),
      ["Arroz extra", "Queso fresco"],
    );

    const arrozComprado = await orm.actualizarArticulo(arroz.id, { comprado: true });
    assert.equal(arrozComprado.comprado, true);

    const eliminados = await orm.eliminarArticulosComprados();
    assert.equal(eliminados, 1);

    const articulosFinales = await orm.listarArticulos();
    assert.deepEqual(
      articulosFinales.map((articulo) => articulo.nombre),
      ["Queso fresco"],
    );

    assert.equal(await orm.eliminarArticulo(queso.id), true);
    assert.deepEqual(await orm.listarArticulos(), []);
  } finally {
    await rm(carpetaPrueba, { recursive: true, force: true });
  }
});
