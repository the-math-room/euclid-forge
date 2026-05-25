import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const PACKAGE_LAYERS = new Set([
  "core",
  "view",
  "meaning",
  "representation",
  "evaluation",
  "geometry",
]);

const SOURCE_EXTENSIONS = /\.(ts|json)$/;

function walk(dir) {
  const out = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      out.push(...walk(path));
      continue;
    }

    if (SOURCE_EXTENSIONS.test(path)) {
      out.push(path);
    }
  }

  return out;
}

function layerOfFile(file) {
  const rel = relative(SRC, file).replaceAll("\\", "/");
  const [layer] = rel.split("/");

  return layer ?? null;
}

const files = walk(SRC)
  .filter((file) => {
    const layer = layerOfFile(file);

    return layer !== null && PACKAGE_LAYERS.has(layer);
  })
  .map((file) => relative(ROOT, file).replaceAll("\\", "/"))
  .sort();

for (const file of files) {
  console.log(file);
}
