import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const FORBIDDEN_CORE_IMPORT_PATTERNS = [
  /from "\.\.\/app\//,
  /from "\.\.\/interaction\//,
  /from "\.\.\/rendering\//,
  /from "\.\.\/styles\//,
];

function sourceFilesInCore(): string[] {
  return readdirSync(new URL(".", import.meta.url))
    .filter((name) => name.endsWith(".ts"))
    .filter((name) => !name.endsWith(".test.ts"))
    .map((name) => join(new URL(".", import.meta.url).pathname, name));
}

describe("core boundary", () => {
  test("core source files do not import app, interaction, rendering, or styles", () => {
    for (const file of sourceFilesInCore()) {
      const source = readFileSync(file, "utf-8");

      for (const pattern of FORBIDDEN_CORE_IMPORT_PATTERNS) {
        expect(source, `${file} matched ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
