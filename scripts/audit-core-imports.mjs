#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const forgeSrc = path.join(root, "apps/forge/src");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const APPROVED_SPECIFIERS = new Set([
  "@euclid-forge/core/evaluation/evaluated",
]);

const DISCOURAGED_PREFIXES = [
  "@euclid-forge/core/geometry/",
  "@euclid-forge/core/core/",
  "@euclid-forge/core/view/",
  "@euclid-forge/core/meaning/",
  "@euclid-forge/core/representation/",
  "@euclid-forge/core/evaluation/",
];

const results = {
  root: [],
  approved: [],
  discouraged: [],
  unknown: [],
};

if (!fs.existsSync(forgeSrc)) {
  console.error(`Missing Forge source directory: ${path.relative(root, forgeSrc)}`);
  process.exit(1);
}

for (const file of walk(forgeSrc)) {
  if (!SOURCE_EXTENSIONS.has(path.extname(file))) {
    continue;
  }

  const rel = normalize(path.relative(root, file));
  const text = fs.readFileSync(file, "utf8");

  for (const specifier of importSpecifiers(text)) {
    if (!specifier.startsWith("@euclid-forge/core")) {
      continue;
    }

    classify(rel, specifier);
  }
}

printReport();

if (results.discouraged.length > 0 || results.unknown.length > 0) {
  process.exitCode = 1;
}

function classify(file, specifier) {
  const entry = { file, specifier };

  if (specifier === "@euclid-forge/core") {
    results.root.push(entry);
    return;
  }

  if (APPROVED_SPECIFIERS.has(specifier)) {
    results.approved.push(entry);
    return;
  }

  if (DISCOURAGED_PREFIXES.some((prefix) => specifier.startsWith(prefix))) {
    results.discouraged.push(entry);
    return;
  }

  results.unknown.push(entry);
}

function printReport() {
  console.log("Core import audit");
  console.log("=================");
  console.log();

  printGroup("Root facade imports", results.root);
  printGroup("Blessed family subpath imports", results.approved);
  printGroup("Discouraged/internal imports", results.discouraged);
  printGroup("Unknown core imports", results.unknown);

  console.log("Summary");
  console.log("-------");
  console.log(`root:        ${results.root.length}`);
  console.log(`approved:    ${results.approved.length}`);
  console.log(`discouraged: ${results.discouraged.length}`);
  console.log(`unknown:     ${results.unknown.length}`);
  console.log();

  if (results.discouraged.length === 0 && results.unknown.length === 0) {
    console.log("Core import audit passed.");
  } else {
    console.error("Core import audit found imports that need review.");
  }
}

function printGroup(title, entries) {
  console.log(title);
  console.log("-".repeat(title.length));

  if (entries.length === 0) {
    console.log("(none)");
    console.log();
    return;
  }

  const sorted = [...entries].sort((a, b) =>
    a.specifier.localeCompare(b.specifier) || a.file.localeCompare(b.file)
  );

  for (const entry of sorted) {
    console.log(`${entry.specifier}`);
    console.log(`  ${entry.file}`);
  }

  console.log();
}

function importSpecifiers(text) {
  const specifiers = [];

  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?[^'"]*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (match[1]) {
        specifiers.push(match[1]);
      }
    }
  }

  return specifiers;
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === "coverage" ||
        entry.name === "test-results" ||
        entry.name === "playwright-report"
      ) {
        continue;
      }

      yield* walk(fullPath);
      continue;
    }

    if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function normalize(value) {
  return value.split(path.sep).join("/");
}
