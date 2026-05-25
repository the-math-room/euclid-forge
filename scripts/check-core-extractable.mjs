import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const EXTRACTABLE_LAYERS = new Set([
  "core",
  "meaning",
  "representation",
  "evaluation",
  "geometry",
]);

const FORBIDDEN_LAYERS = new Set([
  "app",
  "rendering",
  "interaction",
  "styles",
]);

const BROWSER_GLOBAL_PATTERNS = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\bHTMLElement\b/,
  /\bHTMLCanvasElement\b/,
  /\bCanvasRenderingContext2D\b/,
  /\bPointerEvent\b/,
  /\bKeyboardEvent\b/,
  /\bMouseEvent\b/,
  /\bFileReader\b/,
  /\bBlob\b/,
  /\bURL\.createObjectURL\b/,
];

const ALL_LAYERS = [
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

function walk(dir) {
  const out = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      out.push(...walk(path));
      continue;
    }

    if (/\.(ts|tsx|mjs)$/.test(path)) {
      out.push(path);
    }
  }

  return out;
}

function layerOfFile(file) {
  const rel = relative(SRC, file).replaceAll("\\", "/");

  return ALL_LAYERS.find((layer) => rel === layer || rel.startsWith(`${layer}/`)) ?? null;
}

function layerOfResolvedPath(path) {
  const normalized = path.replaceAll("\\", "/");
  const layerPattern = ALL_LAYERS.join("|");
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

  if (!fromLayer || !EXTRACTABLE_LAYERS.has(fromLayer)) {
    continue;
  }

  const source = readFileSync(file, "utf8");

  for (const specifier of importSpecifiers(source)) {
    const resolved = resolveImport(file, specifier);

    if (!resolved) {
      continue;
    }

    const toLayer = layerOfResolvedPath(resolved);

    if (toLayer && FORBIDDEN_LAYERS.has(toLayer)) {
      violations.push({
        file: relative(ROOT, file),
        specifier,
        reason: `extractable core may not import ${toLayer}/`,
      });
    }
  }

  for (const pattern of BROWSER_GLOBAL_PATTERNS) {
    if (pattern.test(source)) {
      violations.push({
        file: relative(ROOT, file),
        specifier: String(pattern),
        reason: "extractable core may not reference browser/DOM globals",
      });
    }
  }
}

if (violations.length > 0) {
  console.error("\nExtractable core violations detected:\n");

  for (const violation of violations) {
    console.error(`- ${violation.file}`);
    console.error(`  imports/ref: ${violation.specifier}`);
    console.error(`  reason:      ${violation.reason}\n`);
  }

  process.exit(1);
}

console.log("Extractable core boundary OK.");
