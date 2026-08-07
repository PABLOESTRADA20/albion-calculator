// Genera src/data/items.ts a partir del dump formateado de ao-bin-dumps.
// Uso: node scripts/generate-items-data.mjs [ruta a items.json]
// Si no se pasa ruta, descarga el archivo desde GitHub (requiere red).

import { writeFileSync, readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json";

const inputPath = process.argv[2];
let raw;
if (inputPath) {
  raw = readFileSync(resolve(inputPath), "utf8");
} else {
  console.log("Descargando items.json...");
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Descarga fallida: ${res.status}`);
  raw = await res.text();
}

const items = JSON.parse(raw);

const entries = [];
for (const item of items) {
  const id = item.UniqueName;
  const en = item.LocalizedNames?.["EN-US"];
  if (!id || !en) continue;
  const es = item.LocalizedNames?.["ES-ES"] ?? undefined;
  entries.push({ id, en, es });
}

entries.sort((a, b) => a.en.localeCompare(b.en));

const lines = entries.map(
  (e) => `  ["${e.id}", "${e.en.replaceAll('"', '\\"')}"${e.es ? `, "${e.es.replaceAll('"', '\\"')}"` : ""}],`
);

const out = `// Generado automaticamente por scripts/generate-items-data.mjs
// Fuente: ${SOURCE_URL}
// No editar a mano; regenerar con: node scripts/generate-items-data.mjs

export type ItemEntry = [id: string, nameEn: string, nameEs?: string];

export const ITEMS: ItemEntry[] = [
${lines.join("\n")}
];
`;

const outPath = resolve(
  fileURLToPath(new URL("../src/data/items.ts", import.meta.url))
);
writeFileSync(outPath, out, "utf8");
console.log(
  `OK: ${entries.length} items escritos en ${basename(outPath)} (${(out.length / 1024).toFixed(0)} KB)`
);
