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
    class TestHTMLElement extends EventTarget {
      isContentEditable = false;
    }

    class TestHTMLInputElement extends TestHTMLElement {}
    class TestHTMLTextAreaElement extends TestHTMLElement {}
    class TestHTMLSelectElement extends TestHTMLElement {}

    const previousHTMLElement = globalThis.HTMLElement;
    const previousHTMLInputElement = globalThis.HTMLInputElement;
    const previousHTMLTextAreaElement = globalThis.HTMLTextAreaElement;
    const previousHTMLSelectElement = globalThis.HTMLSelectElement;

    globalThis.HTMLElement = TestHTMLElement as typeof HTMLElement;
    globalThis.HTMLInputElement =
      TestHTMLInputElement as typeof HTMLInputElement;
    globalThis.HTMLTextAreaElement =
      TestHTMLTextAreaElement as typeof HTMLTextAreaElement;
    globalThis.HTMLSelectElement =
      TestHTMLSelectElement as typeof HTMLSelectElement;

    try {
      const editable = new TestHTMLElement();
      editable.isContentEditable = true;

      expect(shouldIgnoreKeyDownTarget(new TestHTMLInputElement())).toBe(true);
      expect(shouldIgnoreKeyDownTarget(new TestHTMLTextAreaElement())).toBe(
        true,
      );
      expect(shouldIgnoreKeyDownTarget(new TestHTMLSelectElement())).toBe(true);
      expect(shouldIgnoreKeyDownTarget(editable)).toBe(true);
      expect(shouldIgnoreKeyDownTarget(new TestHTMLElement())).toBe(false);
      expect(shouldIgnoreKeyDownTarget(null)).toBe(false);
    } finally {
      globalThis.HTMLElement = previousHTMLElement;
      globalThis.HTMLInputElement = previousHTMLInputElement;
      globalThis.HTMLTextAreaElement = previousHTMLTextAreaElement;
      globalThis.HTMLSelectElement = previousHTMLSelectElement;
    }
  });
});
