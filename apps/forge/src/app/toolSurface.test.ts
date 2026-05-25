import { describe, expect, test, vi } from "vitest";

import { constructionTool, emptyActiveTool } from "./activeTool";
import { installToolSurface, updateToolSurface } from "./toolSurface";

type Listener = () => void;

class FakeClassList {
  readonly values = new Set<string>();

  constructor(initial: string) {
    for (const value of initial.split(/\s+/)) {
      if (value.length > 0) {
        this.values.add(value);
      }
    }
  }

  toggle(value: string, force: boolean): void {
    if (force) {
      this.values.add(value);
    } else {
      this.values.delete(value);
    }
  }
}

class FakeElement {
  id = "";
  className = "";
  textContent: string | null = null;
  title = "";
  type = "";
  readonly dataset: Record<string, string> = {};
  readonly children: FakeElement[] = [];
  readonly attributes = new Map<string, string>();
  readonly listeners = new Map<string, Listener[]>();
  parent: FakeElement | null = null;
  removed = false;

  get classList(): FakeClassList {
    return new FakeClassList(this.className);
  }

  append(...children: FakeElement[]): void {
    for (const child of children) {
      child.parent = this;
      this.children.push(child);
    }
  }

  remove(): void {
    this.removed = true;

    if (!this.parent) {
      return;
    }

    const index = this.parent.children.indexOf(this);

    if (index >= 0) {
      this.parent.children.splice(index, 1);
    }
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(name: string, listener: Listener): void {
    const listeners = this.listeners.get(name) ?? [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
  }

  click(): void {
    for (const listener of this.listeners.get("click") ?? []) {
      listener();
    }
  }

  querySelector<T = FakeElement>(selector: string): T | null {
    return this.querySelectorAll<T>(selector)[0] ?? null;
  }

  querySelectorAll<T = FakeElement>(selector: string): T[] {
    const matches: FakeElement[] = [];

    for (const child of this.walk()) {
      if (matchesSelector(child, selector)) {
        matches.push(child);
      }
    }

    return matches as T[];
  }

  private *walk(): Iterable<FakeElement> {
    for (const child of this.children) {
      if (!child.removed) {
        yield child;
        yield* child.walk();
      }
    }
  }
}

class FakeDocument {
  readonly body = new FakeElement();

  constructor() {
    const app = new FakeElement();
    app.id = "app";
    this.body.append(app);
  }

  createElement(): FakeElement {
    return new FakeElement();
  }

  querySelector<T = FakeElement>(selector: string): T | null {
    return this.body.querySelector<T>(selector);
  }

  querySelectorAll<T = FakeElement>(selector: string): T[] {
    return this.body.querySelectorAll<T>(selector);
  }
}

function fakeDocument(): Document {
  return new FakeDocument() as unknown as Document;
}

function matchesSelector(element: FakeElement, selector: string): boolean {
  if (selector === "button") {
    return element.type === "button";
  }

  if (selector.startsWith("#")) {
    return element.id === selector.slice(1);
  }

  if (selector.startsWith(".")) {
    return element.className.split(/\s+/).includes(selector.slice(1));
  }

  const dataToolMatch = selector.match(/^\[data-tool="([^"]+)"\]$/);

  if (dataToolMatch) {
    return element.dataset.tool === dataToolMatch[1];
  }

  return false;
}

describe("app/toolSurface", () => {
  test("installs tool buttons and status text", () => {
    const document = fakeDocument();

    const onToolChange = vi.fn();
    const surface = installToolSurface(document, { onToolChange });

    surface.update(emptyActiveTool());

    expect(surface.root.id).toBe("tool-surface");
    expect(
      [...surface.root.querySelectorAll<HTMLButtonElement>("button")].map(
        (button) => button.textContent,
      ),
    ).toEqual(["Move", "Point", "Segment", "Circle", "Triangle"]);

    expect(
      surface.root.querySelector(".tool-surface__status")?.textContent,
    ).toBe("Select or drag geometry.");

    expect(
      surface.root
        .querySelector<HTMLButtonElement>('[data-tool="select"]')
        ?.getAttribute("aria-pressed"),
    ).toBe("true");
  });

  test("clicking a tool button emits the selected active tool", () => {
    const document = fakeDocument();

    const onToolChange = vi.fn();
    const surface = installToolSurface(document, { onToolChange });

    surface.root
      .querySelector<HTMLButtonElement>('[data-tool="segment"]')
      ?.click();

    expect(onToolChange).toHaveBeenCalledWith({
      kind: "segment",
      inputs: [],
    });
  });

  test("updates active button and construction status", () => {
    const document = fakeDocument();

    const surface = installToolSurface(document, { onToolChange: vi.fn() });

    updateToolSurface(surface.root, constructionTool("triangle"));

    expect(
      surface.root
        .querySelector<HTMLButtonElement>('[data-tool="triangle"]')
        ?.getAttribute("aria-pressed"),
    ).toBe("true");

    expect(
      surface.root
        .querySelector<HTMLButtonElement>('[data-tool="select"]')
        ?.getAttribute("aria-pressed"),
    ).toBe("false");

    expect(
      surface.root.querySelector(".tool-surface__status")?.textContent,
    ).toBe("Triangle tool: choose point 1 of 3.");
  });

  test("reinstalling replaces an existing tool surface", () => {
    const document = fakeDocument();

    installToolSurface(document, { onToolChange: vi.fn() });
    installToolSurface(document, { onToolChange: vi.fn() });

    expect(document.querySelectorAll("#tool-surface")).toHaveLength(1);
  });
});
