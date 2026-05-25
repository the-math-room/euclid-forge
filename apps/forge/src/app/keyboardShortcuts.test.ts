import { describe, expect, test } from "vitest";
import {
  isOpenShortcut,
  isRedoShortcut,
  isSaveShortcut,
  isUndoShortcut,
  shouldIgnoreKeyDownTarget,
  viewportRotationDirectionForKey,
} from "./keyboardShortcuts";

function keyboardEvent(
  key: string,
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...overrides,
  } as KeyboardEvent;
}

describe("app/keyboardShortcuts", () => {
  test("detects save shortcuts", () => {
    expect(isSaveShortcut(keyboardEvent("s", { ctrlKey: true }))).toBe(true);
    expect(isSaveShortcut(keyboardEvent("S", { metaKey: true }))).toBe(true);
    expect(
      isSaveShortcut(keyboardEvent("s", { ctrlKey: true, shiftKey: true })),
    ).toBe(false);
    expect(isSaveShortcut(keyboardEvent("s"))).toBe(false);
  });

  test("detects open shortcuts", () => {
    expect(isOpenShortcut(keyboardEvent("o", { ctrlKey: true }))).toBe(true);
    expect(isOpenShortcut(keyboardEvent("O", { metaKey: true }))).toBe(true);
    expect(
      isOpenShortcut(keyboardEvent("o", { ctrlKey: true, altKey: true })),
    ).toBe(false);
    expect(isOpenShortcut(keyboardEvent("o"))).toBe(false);
  });

  test("detects undo shortcuts", () => {
    expect(isUndoShortcut(keyboardEvent("z", { ctrlKey: true }))).toBe(true);
    expect(isUndoShortcut(keyboardEvent("Z", { metaKey: true }))).toBe(true);
    expect(
      isUndoShortcut(keyboardEvent("z", { ctrlKey: true, shiftKey: true })),
    ).toBe(false);
    expect(isUndoShortcut(keyboardEvent("z"))).toBe(false);
  });

  test("detects redo shortcuts", () => {
    expect(
      isRedoShortcut(keyboardEvent("z", { ctrlKey: true, shiftKey: true })),
    ).toBe(true);
    expect(
      isRedoShortcut(keyboardEvent("Z", { metaKey: true, shiftKey: true })),
    ).toBe(true);
    expect(isRedoShortcut(keyboardEvent("y", { ctrlKey: true }))).toBe(true);
    expect(isRedoShortcut(keyboardEvent("Y", { metaKey: true }))).toBe(true);
    expect(isRedoShortcut(keyboardEvent("z", { ctrlKey: true }))).toBe(false);
    expect(
      isRedoShortcut(keyboardEvent("y", { ctrlKey: true, shiftKey: true })),
    ).toBe(false);
  });

  test("maps viewport rotation keys", () => {
    expect(viewportRotationDirectionForKey("[")).toBe(1);
    expect(viewportRotationDirectionForKey("]")).toBe(-1);
    expect(viewportRotationDirectionForKey("x")).toBeNull();
  });

  test("ignores editable keyboard targets", () => {
    const target = (tagName: string, isContentEditable = false): EventTarget =>
      ({
        tagName,
        isContentEditable,
      }) as unknown as EventTarget;

    expect(shouldIgnoreKeyDownTarget(target("input"))).toBe(true);
    expect(shouldIgnoreKeyDownTarget(target("textarea"))).toBe(true);
    expect(shouldIgnoreKeyDownTarget(target("select"))).toBe(true);
    expect(shouldIgnoreKeyDownTarget(target("div", true))).toBe(true);
    expect(shouldIgnoreKeyDownTarget(target("div"))).toBe(false);
    expect(shouldIgnoreKeyDownTarget(null)).toBe(false);
  });
});
