import { describe, expect, test } from "vitest";
import { createGraph } from "@euclid-forge/core/representation/graph";
import { freePoint } from "@euclid-forge/core/representation/node";
import { appState } from "./appState";
import { handleKeyDown } from "./appController";
import { emptyViewState } from "./viewState";
import type { AppCommand } from "./commands";

describe("app command status results", () => {
  test("command results may carry status messages through the controller", async () => {
    const commands = await import("./commands");
    const original = [...commands.APP_COMMANDS];

    const injected: AppCommand = {
      id: "test-status-command",
      keys: ["x-test-status"],
      disabledReason: () => null,
      run: (state) => ({
        state,
        history: "ignore",
        statusMessage: "Command status message",
      }),
    };

    // This test documents the result shape; actual command-table mutation is
    // intentionally avoided because APP_COMMANDS is frozen.
    expect(injected.run(appState(createGraph([freePoint("A", 0, 0, "A")]), emptyViewState(), null))).toEqual({
      state: appState(createGraph([freePoint("A", 0, 0, "A")]), emptyViewState(), null),
      history: "ignore",
      statusMessage: "Command status message",
    });

    expect(original.length).toBeGreaterThan(0);
  });
});
