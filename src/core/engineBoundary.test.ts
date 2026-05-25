import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const FORBIDDEN_ENGINE_IMPORTS = [
  "../app/appController",
  "../app/appRuntime",
  "../app/canvasSurface",
  "../app/commands",
  "../app/domEvents",
  "../app/keyboardShortcuts",
  "../app/main",
  "../app/pointerIntent",
  "../app/renderScheduler",
  "../app/statusSurface",
  "../app/transitionEffects",
  "../app/viewportMotion",
  "../interaction/",
  "../rendering/",
  "../styles/",
];

describe("core/engine boundary", () => {
  test("engine facade avoids browser, rendering, interaction, and command imports", () => {
    const source = readFileSync(new URL("./engine.ts", import.meta.url), "utf-8");

    for (const forbidden of FORBIDDEN_ENGINE_IMPORTS) {
      expect(source.includes(forbidden), forbidden).toBe(false);
    }
  });
});
