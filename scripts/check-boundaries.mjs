#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "dist-ssr",
  "coverage",
  "test-results",
  "playwright-report",
  ".vite",
  ".cache",
  ".tmp",
]);

const CORE_ROOT_CANDIDATES = [
  "packages/core/src",
  "src/core",
  "src/meaning",
  "src/representation",
  "src/evaluation",
];

const FORGE_ROOT_CANDIDATES = [
  "apps/forge/src",
  "src/app",
  "src/interaction",
  "src/rendering",
  "src/styles",
];

const FORGE_ONLY_PATH_PARTS = [
  "/apps/forge/",
  "/src/app/",
  "/src/interaction/",
  "/src/rendering/",
  "/src/styles/",
];

const BROWSER_GLOBAL_PATTERNS = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\bHTMLElement\b/,
  /\bHTMLCanvasElement\b/,
  /\bCanvasRenderingContext2D\b/,
  /\bPointerEvent\b/,
  /\bKeyboardEvent\b/,
  /\bMouseEvent\b/,
  /\bTouchEvent\b/,
  /\bFile\b/,
  /\bBlob\b/,
  /\bFileReader\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\brequestAnimationFrame\b/,
  /\bcancelAnimationFrame\b/,
  /\bURL\.createObjectURL\b/,
  /\bURL\.revokeObjectURL\b/,
];

const errors = [];

for (const file of walk(root)) {
  const rel = normalize(path.relative(root, file));

  if (!SOURCE_EXTENSIONS.has(path.extname(file))) {
    continue;
  }

  const text = fs.readFileSync(file, "utf8");

  if (isCoreFile(rel)) {
    checkCoreFile(rel, text);
  }

  checkLegacyLayerDirection(rel, text);
}

if (errors.length > 0) {
  console.error("Boundary check failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Boundary check passed.");

function checkCoreFile(rel, text) {
  for (const specifier of importSpecifiers(text)) {
    if (isForgeImport(rel, specifier)) {
      errors.push(
        `${rel} imports forge-owned code (${specifier}). Core must remain headless and must not depend on forge.`,
      );
    }
  }

  for (const pattern of BROWSER_GLOBAL_PATTERNS) {
    if (pattern.test(stripCommentsAndStrings(text))) {
      errors.push(
        `${rel} appears to use browser/DOM API ${pattern}. Core must stay browser-free.`,
      );
    }
  }
}

function checkLegacyLayerDirection(rel, text) {
  // Compatibility check for the pre-monorepo app layout.
  // This preserves the old local layer discipline while the tree is moving.
  const layer = legacyLayerFor(rel);

  if (!layer) {
    return;
  }

  const allowed = {
    app: new Set(["app", "interaction", "rendering", "styles", "core"]),
    interaction: new Set(["interaction", "core"]),
    rendering: new Set(["rendering", "core"]),
    styles: new Set(["styles"]),
    core: new Set(["core"]),
  }[layer];

  for (const specifier of importSpecifiers(text)) {
    const targetLayer = legacyLayerForImport(rel, specifier);

    if (!targetLayer) {
      continue;
    }

    if (!allowed.has(targetLayer)) {
      errors.push(
        `${rel} imports ${specifier}, crossing from ${layer} to ${targetLayer}.`,
      );
    }
  }
}

function isCoreFile(rel) {
  return CORE_ROOT_CANDIDATES.some(
    (candidate) => rel === candidate || rel.startsWith(`${candidate}/`),
  );
}

function isForgeFile(rel) {
  return FORGE_ROOT_CANDIDATES.some(
    (candidate) => rel === candidate || rel.startsWith(`${candidate}/`),
  );
}

function isForgeImport(fromRel, specifier) {
  if (specifier.startsWith("@euclid-forge/forge")) {
    return true;
  }

  if (specifier.startsWith("@euclid-forge/core")) {
    return false;
  }

  if (!specifier.startsWith(".")) {
    return false;
  }

  const fromDir = path.posix.dirname(fromRel);
  const resolved = normalize(path.posix.normalize(path.posix.join(fromDir, specifier)));
  const withSlashes = `/${resolved}/`;

  if (isForgeFile(resolved)) {
    return true;
  }

  return FORGE_ONLY_PATH_PARTS.some((part) => withSlashes.includes(part));
}

function legacyLayerFor(rel) {
  if (rel.startsWith("src/app/")) return "app";
  if (rel.startsWith("src/interaction/")) return "interaction";
  if (rel.startsWith("src/rendering/")) return "rendering";
  if (rel.startsWith("src/styles/")) return "styles";
  if (
    rel.startsWith("src/core/") ||
    rel.startsWith("src/meaning/") ||
    rel.startsWith("src/representation/") ||
    rel.startsWith("src/evaluation/")
  ) {
    return "core";
  }

  return null;
}

function legacyLayerForImport(fromRel, specifier) {
  if (specifier.startsWith("@euclid-forge/core")) {
    return "core";
  }

  if (!specifier.startsWith(".")) {
    return null;
  }

  const fromDir = path.posix.dirname(fromRel);
  const resolved = normalize(path.posix.normalize(path.posix.join(fromDir, specifier)));

  return legacyLayerFor(resolved);
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

function stripCommentsAndStrings(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/`(?:\\.|[^`])*`/g, "``")
    .replace(/"(?:\\.|[^"])*"/g, "\"\"")
    .replace(/'(?:\\.|[^'])*'/g, "''");
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function normalize(value) {
  return value.split(path.sep).join("/");
}
