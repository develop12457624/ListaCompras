import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { crearArticulo, normalizarNombre, validarArticulo } from "./listaCompras.js";

export class ListaComprasOrm {
  constructor(rutaBaseDatos = join(process.cwd(), "datos", "lista-compras.bd.json")) {
    this.rutaBaseDatos = rutaBaseDatos;
  }

  async migrar() {
    await mkdir(dirname(this.rutaBaseDatos), { recursive: true });

    try {
      await readFile(this.rutaBaseDatos, "utf8");
    } catch {
      await this.guardarBaseDatos({
        tablas: {
          articulos: [],
        },
        siguienteId: 1,
      });
    }
  }

  async listarArticulos() {
    const baseDatos = await this.leerBaseDatos();
    return [...baseDatos.tablas.articulos].sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
  }

  async buscarArticuloPorId(id) {
    const baseDatos = await this.leerBaseDatos();
    return baseDatos.tablas.articulos.find((articulo) => articulo.id === String(id)) ?? null;
  }

  async crearArticulo(datosArticulo) {
    const baseDatos = await this.leerBaseDatos();
    const articulo = crearArticulo({
      id: String(baseDatos.siguienteId),
      nombre: datosArticulo.nombre,
      categoria: datosArticulo.categoria,
      comprado: datosArticulo.comprado,
      creadoEn: datosArticulo.creadoEn,
    });

    baseDatos.siguienteId += 1;
    baseDatos.tablas.articulos.push(articulo);
    await this.guardarBaseDatos(baseDatos);
    return articulo;
  }

  async actualizarArticulo(id, cambios) {
    const baseDatos = await this.leerBaseDatos();
    const indice = baseDatos.tablas.articulos.findIndex((articulo) => articulo.id === String(id));

    if (indice === -1) {
      return null;
    }

    const articuloActual = baseDatos.tablas.articulos[indice];
    const articuloActualizado = {
      ...articuloActual,
      nombre: cambios.nombre === undefined ? articuloActual.nombre : normalizarNombre(cambios.nombre),
      categoria: cambios.categoria === undefined ? articuloActual.categoria : cambios.categoria,
      comprado: cambios.comprado === undefined ? articuloActual.comprado : Boolean(cambios.comprado),
    };
    const validacion = validarArticulo(articuloActualizado);

    if (!validacion.valido) {
      throw new Error(validacion.errores.join(". "));
    }

    baseDatos.tablas.articulos[indice] = articuloActualizado;
    await this.guardarBaseDatos(baseDatos);
    return articuloActualizado;
  }

  async eliminarArticulo(id) {
    const baseDatos = await this.leerBaseDatos();
    const cantidadInicial = baseDatos.tablas.articulos.length;
    baseDatos.tablas.articulos = baseDatos.tablas.articulos.filter((articulo) => articulo.id !== String(id));
    await this.guardarBaseDatos(baseDatos);
    return baseDatos.tablas.articulos.length !== cantidadInicial;
  }

  async eliminarArticulosComprados() {
    const baseDatos = await this.leerBaseDatos();
    const eliminados = baseDatos.tablas.articulos.filter((articulo) => articulo.comprado).length;
    baseDatos.tablas.articulos = baseDatos.tablas.articulos.filter((articulo) => !articulo.comprado);
    await this.guardarBaseDatos(baseDatos);
    return eliminados;
  }

  async leerBaseDatos() {
    await this.migrar();
    const contenido = await readFile(this.rutaBaseDatos, "utf8");
    const baseDatos = JSON.parse(contenido);

    if (!baseDatos.tablas || !Array.isArray(baseDatos.tablas.articulos)) {
      throw new Error("La base de datos no tiene la tabla articulos");
    }

    if (!Number.isInteger(baseDatos.siguienteId)) {
      baseDatos.siguienteId = baseDatos.tablas.articulos.length + 1;
    }

    return baseDatos;
  }

  async guardarBaseDatos(baseDatos) {
    await mkdir(dirname(this.rutaBaseDatos), { recursive: true });
    await writeFile(this.rutaBaseDatos, JSON.stringify(baseDatos, null, 2), "utf8");
  }
}
