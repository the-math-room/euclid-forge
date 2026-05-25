export type ViewportMotionDirection = -1 | 1;

export type ViewportMotionInput = Readonly<
  | {
      kind: "PAN_X";
      direction: ViewportMotionDirection;
    }
  | {
      kind: "PAN_Y";
      direction: ViewportMotionDirection;
    }
  | {
      kind: "ZOOM";
      direction: ViewportMotionDirection;
    }
  | {
      kind: "ROTATE";
      direction: ViewportMotionDirection;
    }
>;

export type ViewportRotationDirection = ViewportMotionDirection;

export function isSaveShortcut(event: KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "s"
  );
}

export function isOpenShortcut(event: KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "o"
  );
}

export function isUndoShortcut(event: KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "z"
  );
}

export function isRedoShortcut(event: KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    ((event.shiftKey && event.key.toLowerCase() === "z") ||
      (!event.shiftKey && event.key.toLowerCase() === "y"))
  );
}

export function viewportMotionInputForKey(
  key: string,
): ViewportMotionInput | null {
  switch (key) {
    case "ArrowLeft":
      return {
        kind: "PAN_X",
        direction: -1,
      };

    case "ArrowRight":
      return {
        kind: "PAN_X",
        direction: 1,
      };

    case "ArrowUp":
      return {
        kind: "PAN_Y",
        direction: 1,
      };

    case "ArrowDown":
      return {
        kind: "PAN_Y",
        direction: -1,
      };

    case "+":
    case "=":
      return {
        kind: "ZOOM",
        direction: 1,
      };

    case "-":
    case "_":
      return {
        kind: "ZOOM",
        direction: -1,
      };

    case "[":
      return {
        kind: "ROTATE",
        direction: 1,
      };

    case "]":
      return {
        kind: "ROTATE",
        direction: -1,
      };

    default:
      return null;
  }
}

export function viewportRotationDirectionForKey(
  key: string,
): ViewportRotationDirection | null {
  const input = viewportMotionInputForKey(key);

  return input?.kind === "ROTATE" ? input.direction : null;
}

export function shouldIgnoreKeyDownTarget(target: EventTarget | null): boolean {
  if (!isKeyboardEditableTarget(target)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

type KeyboardEditableTarget = EventTarget &
  Readonly<{
    tagName: string;
    isContentEditable: boolean;
  }>;

function isKeyboardEditableTarget(
  target: EventTarget | null,
): target is KeyboardEditableTarget {
  return (
    typeof target === "object" &&
    target !== null &&
    "tagName" in target &&
    typeof target.tagName === "string" &&
    "isContentEditable" in target &&
    typeof target.isContentEditable === "boolean"
  );
}
