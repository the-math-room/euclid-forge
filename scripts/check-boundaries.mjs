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

const CORE_SRC_ROOT = "packages/core/src";
const FORGE_SRC_ROOT = "apps/forge/src";

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

  if (isCoreSource(rel)) {
    checkCoreBoundary(rel, text);
  }

  if (isForgeSource(rel)) {
    checkForgeLayerBoundary(rel, text);
  }
}

if (errors.length > 0) {
  console.error("Boundary check failed:\n");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log("Boundary check passed.");

function checkCoreBoundary(rel, text) {
  for (const specifier of importSpecifiers(text)) {
    if (importsForge(rel, specifier)) {
      errors.push(
        `${rel} imports forge-owned code (${specifier}). Core must remain headless and must not depend on Forge.`,
      );
    }
  }

  // Test files may use Node test infrastructure, but production core must stay
  // browser-free. This keeps the architectural guarantee focused on shipped
  // source while allowing tests to remain pragmatic.
  if (isTestFile(rel)) {
    return;
  }

  const stripped = stripCommentsAndStrings(text);

  for (const pattern of BROWSER_GLOBAL_PATTERNS) {
    if (pattern.test(stripped)) {
      errors.push(
        `${rel} appears to use browser/DOM API ${pattern}. Core must stay browser-free.`,
      );
    }
  }
}

function checkForgeLayerBoundary(rel, text) {
  const layer = forgeLayerFor(rel);

  if (!layer) {
    return;
  }

  const allowed = allowedForgeTargets(layer);

  for (const specifier of importSpecifiers(text)) {
    const targetLayer = forgeLayerForImport(rel, specifier);

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

function allowedForgeTargets(layer) {
  return {
    app: new Set(["app", "interaction", "rendering", "styles", "testHelpers", "core"]),
    interaction: new Set(["interaction", "testHelpers", "core"]),
    rendering: new Set(["rendering", "testHelpers", "core"]),
    styles: new Set(["styles"]),
    testHelpers: new Set(["testHelpers", "core"]),
  }[layer] ?? new Set();
}

function isCoreSource(rel) {
  return rel === CORE_SRC_ROOT || rel.startsWith(`${CORE_SRC_ROOT}/`);
}

function isForgeSource(rel) {
  return rel === FORGE_SRC_ROOT || rel.startsWith(`${FORGE_SRC_ROOT}/`);
}

function isTestFile(rel) {
  return (
    rel.endsWith(".test.ts") ||
    rel.endsWith(".test.tsx") ||
    rel.endsWith(".spec.ts") ||
    rel.endsWith(".spec.tsx")
  );
}

function importsForge(fromRel, specifier) {
  if (specifier.startsWith("@euclid-forge/forge")) {
    return true;
  }

  if (specifier.startsWith("@euclid-forge/core")) {
    return false;
  }

  if (!specifier.startsWith(".")) {
    return false;
  }

  const resolved = resolveRelativeSpecifier(fromRel, specifier);

  return resolved === FORGE_SRC_ROOT || resolved.startsWith(`${FORGE_SRC_ROOT}/`);
}

function forgeLayerFor(rel) {
  if (rel.startsWith("apps/forge/src/app/")) return "app";
  if (rel.startsWith("apps/forge/src/interaction/")) return "interaction";
  if (rel.startsWith("apps/forge/src/rendering/")) return "rendering";
  if (rel.startsWith("apps/forge/src/styles/")) return "styles";
  if (rel.startsWith("apps/forge/src/testHelpers/")) return "testHelpers";

  return null;
}

function forgeLayerForImport(fromRel, specifier) {
  if (specifier.startsWith("@euclid-forge/core")) {
    return "core";
  }

  if (!specifier.startsWith(".")) {
    return null;
  }

  const resolved = resolveRelativeSpecifier(fromRel, specifier);

  return forgeLayerFor(resolved);
}

function resolveRelativeSpecifier(fromRel, specifier) {
  const fromDir = path.posix.dirname(fromRel);
  return normalize(path.posix.normalize(path.posix.join(fromDir, specifier)));
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
