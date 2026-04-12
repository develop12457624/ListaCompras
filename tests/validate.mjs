import { readFileSync, existsSync } from "fs";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const required = ["index.html", "styles.css", "app.js"];
for (const name of required) {
  const p = join(root, name);
  if (!existsSync(p)) {
    console.error("Archivo requerido no encontrado:", name);
    process.exit(1);
  }
}

const html = readFileSync(join(root, "index.html"), "utf8");
if (!html.includes('<html lang="es">')) {
  console.error("index.html no contiene estructura esperada");
  process.exit(1);
}
if (!html.includes('name="description"')) {
  console.error("index.html debe incluir meta descripción");
  process.exit(1);
}
if (!html.includes('charset="UTF-8"')) {
  console.error("index.html debe declarar charset UTF-8");
  process.exit(1);
}

execFileSync(process.execPath, ["--check", join(root, "app.js")], { stdio: "inherit" });

console.log("Pruebas de validación superadas.");
