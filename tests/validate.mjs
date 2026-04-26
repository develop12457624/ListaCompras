import { readFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const carpetaActual = dirname(fileURLToPath(import.meta.url));
const raiz = join(carpetaActual, "..");

const archivosRequeridos = [
  "index.html",
  "styles.css",
  "app.js",
  "servidor.js",
  "src/listaCompras.js",
  "src/listaComprasOrm.js",
];

for (const nombre of archivosRequeridos) {
  const ruta = join(raiz, nombre);

  if (!existsSync(ruta)) {
    console.error("Archivo requerido no encontrado:", nombre);
    process.exit(1);
  }
}

const html = readFileSync(join(raiz, "index.html"), "utf8");

if (!html.includes('<html lang="es">')) {
  console.error("index.html no contiene estructura esperada");
  process.exit(1);
}

if (!html.includes('name="description"')) {
  console.error("index.html debe incluir meta descripcion");
  process.exit(1);
}

execFileSync(process.execPath, ["--check", join(raiz, "app.js")], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", join(raiz, "servidor.js")], { stdio: "inherit" });

console.log("Pruebas de validacion superadas.");
