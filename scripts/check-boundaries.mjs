import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const layers = [
  "meaning",
  "representation",
  "evaluation",
  "rendering",
  "interaction",
  "geometry",
  "core",
  "app",
  "styles",
];

const allowedImports = {
  meaning: [],
  representation: ["meaning", "geometry"],
  evaluation: ["meaning", "representation", "geometry"],
  rendering: ["meaning", "evaluation", "geometry"],
  interaction: ["meaning", "representation", "evaluation", "rendering", "geometry"],
  geometry: ["meaning", "representation", "evaluation", "rendering"],
  core: ["meaning", "representation", "evaluation"],
  app: ["meaning", "representation", "evaluation", "rendering", "interaction", "core", "styles"],
  styles: [],
};

function walk(dir) {
  const out = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      out.push(...walk(path));
      continue;
    }

    if (/\.(ts|tsx)$/.test(path)) {
      out.push(path);
    }
  }

  return out;
}

function layerOfFile(file) {
  const rel = relative(SRC, file).replaceAll("\\", "/");

  return layers.find((layer) => rel === layer || rel.startsWith(`${layer}/`)) ?? null;
}

function layerOfResolvedPath(path) {
  const normalized = path.replaceAll("\\", "/");
  const layerPattern = layers.join("|");
  const match = normalized.match(
    new RegExp(`(?:^|/)src/(${layerPattern})(?:/|$)`),
  );

  return match?.[1] ?? null;
}

function resolveImport(fromFile, specifier) {
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return normalize(join(dirname(fromFile), specifier));
  }

  return null;
}

function importSpecifiers(source) {
  const specs = [];

  const patterns = [
    /import(?:[\s\S]*?)from\s+["']([^"']+)["']/g,
    /import\s+["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(source)) !== null) {
      specs.push(match[1]);
    }
  }

  return specs;
}

const violations = [];

for (const file of walk(SRC)) {
  const fromLayer = layerOfFile(file);

  if (!fromLayer) {
    continue;
  }

  const source = readFileSync(file, "utf8");

  for (const specifier of importSpecifiers(source)) {
    const resolved = resolveImport(file, specifier);

    if (!resolved) {
      continue;
    }

    const toLayer = layerOfResolvedPath(resolved);

    if (!toLayer || toLayer === fromLayer) {
      continue;
    }

    if (!allowedImports[fromLayer].includes(toLayer)) {
      violations.push({
        file: relative(ROOT, file),
        specifier,
        reason: `${fromLayer}/ may not import ${toLayer}/`,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("\nDenotational boundary violations detected:\n");

  for (const violation of violations) {
    console.error(`- ${violation.file}`);
    console.error(`  imports: ${violation.specifier}`);
    console.error(`  reason:  ${violation.reason}\n`);
  }

  process.exit(1);
}

console.log("Denotational boundaries OK.");
