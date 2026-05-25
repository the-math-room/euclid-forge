import { describe, expect, test, vi } from "vitest";
import { statusSurfaceForDocument } from "./statusSurface";

function fakeElement(tagName: string): HTMLElement {
  const attributes = new Map<string, string>();

  return {
    tagName,
    id: "",
    role: "",
    hidden: false,
    textContent: "",
    setAttribute: vi.fn((name: string, value: string) => {
      attributes.set(name, value);
    }),
    getAttribute: vi.fn((name: string) => attributes.get(name) ?? null),
  } as unknown as HTMLElement;
}

function fakeDocument(
  statusElement: HTMLElement | null,
  appElement: HTMLElement | null,
): Document {
  return {
    querySelector: vi.fn((selector: string) => {
      if (selector === "#status-message") {
        return statusElement;
      }

      if (selector === "#app") {
        return appElement;
      }

      return null;
    }),
    createElement: vi.fn((tagName: string) => fakeElement(tagName)),
  } as unknown as Document;
}

describe("app/statusSurface", () => {
  test("uses an existing status element", () => {
    const status = fakeElement("div");
    const app = {
      append: vi.fn(),
    } as unknown as HTMLElement;
    const document = fakeDocument(status, app);

    const surface = statusSurfaceForDocument(document);

    surface.show("Cannot delete A.");

    expect(status.textContent).toBe("Cannot delete A.");
    expect(status.hidden).toBe(false);
    expect(app.append).not.toHaveBeenCalled();
  });

  test("creates a status element inside #app when missing", () => {
    const append = vi.fn();
    const app = {
      append,
    } as unknown as HTMLElement;
    const document = fakeDocument(null, app);

    const surface = statusSurfaceForDocument(document);

    expect(document.createElement).toHaveBeenCalledWith("div");
    expect(append).toHaveBeenCalledOnce();

    const status = append.mock.calls[0]?.[0] as HTMLElement;

    expect(status.id).toBe("status-message");
    expect(status.role).toBe("status");
    expect(status.setAttribute).toHaveBeenCalledWith("aria-live", "polite");
    expect(status.hidden).toBe(true);

    surface.show("Blocked.");

    expect(status.textContent).toBe("Blocked.");
    expect(status.hidden).toBe(false);
  });

  test("clears the status element", () => {
    const status = fakeElement("div");
    const surface = statusSurfaceForDocument(fakeDocument(status, null));

    surface.show("Blocked.");
    surface.clear();

    expect(status.textContent).toBe("");
    expect(status.hidden).toBe(true);
  });

  test("throws when status and app root are missing", () => {
    expect(() => statusSurfaceForDocument(fakeDocument(null, null))).toThrow(
      "Missing #app",
    );
  });
});
