import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { ListaComprasOrm } from "./src/listaComprasOrm.js";

const puerto = Number(process.env.PUERTO ?? 3000);
const carpetaProyecto = process.cwd();
const orm = new ListaComprasOrm();

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

await orm.migrar();

const servidor = createServer(async (peticion, respuesta) => {
  try {
    const url = new URL(peticion.url, `http://${peticion.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await manejarApi(peticion, respuesta, url);
      return;
    }

    await manejarArchivo(respuesta, url.pathname);
  } catch (error) {
    responderJson(respuesta, 500, { error: error.message });
  }
});

servidor.listen(puerto, () => {
  console.log(`Lista de compras disponible en http://localhost:${puerto}`);
});

async function manejarApi(peticion, respuesta, url) {
  if (peticion.method === "GET" && url.pathname === "/api/articulos") {
    responderJson(respuesta, 200, await orm.listarArticulos());
    return;
  }

  if (peticion.method === "POST" && url.pathname === "/api/articulos") {
    responderJson(respuesta, 201, await orm.crearArticulo(await leerJson(peticion)));
    return;
  }

  const coincidenciaArticulo = url.pathname.match(/^\/api\/articulos\/([^/]+)$/);

  if (coincidenciaArticulo && peticion.method === "PATCH") {
    const articulo = await orm.actualizarArticulo(coincidenciaArticulo[1], await leerJson(peticion));

    if (!articulo) {
      responderJson(respuesta, 404, { error: "Articulo no encontrado" });
      return;
    }

    responderJson(respuesta, 200, articulo);
    return;
  }

  if (coincidenciaArticulo && peticion.method === "DELETE") {
    const eliminado = await orm.eliminarArticulo(coincidenciaArticulo[1]);
    responderJson(respuesta, eliminado ? 200 : 404, { eliminado });
    return;
  }

  if (peticion.method === "DELETE" && url.pathname === "/api/articulos-comprados") {
    responderJson(respuesta, 200, { eliminados: await orm.eliminarArticulosComprados() });
    return;
  }

  responderJson(respuesta, 404, { error: "Ruta no encontrada" });
}

async function manejarArchivo(respuesta, rutaUrl) {
  const rutaRelativa = rutaUrl === "/" ? "index.html" : decodeURIComponent(rutaUrl.slice(1));
  const rutaArchivo = normalize(join(carpetaProyecto, rutaRelativa));

  if (!rutaArchivo.startsWith(carpetaProyecto)) {
    respuesta.writeHead(403);
    respuesta.end("Acceso denegado");
    return;
  }

  try {
    const contenido = await readFile(rutaArchivo);
    respuesta.writeHead(200, { "Content-Type": tipos[extname(rutaArchivo)] ?? "application/octet-stream" });
    respuesta.end(contenido);
  } catch {
    respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    respuesta.end("Archivo no encontrado");
  }
}

async function leerJson(peticion) {
  let contenido = "";

  for await (const parte of peticion) {
    contenido += parte;
  }

  return contenido ? JSON.parse(contenido) : {};
}

function responderJson(respuesta, estado, datos) {
  respuesta.writeHead(estado, { "Content-Type": "application/json; charset=utf-8" });
  respuesta.end(JSON.stringify(datos));
}
