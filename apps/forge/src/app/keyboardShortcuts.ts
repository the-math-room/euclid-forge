export type ViewportRotationDirection = -1 | 1;

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

export function viewportRotationDirectionForKey(
  key: string,
): ViewportRotationDirection | null {
  if (key === "[") {
    return 1;
  }

  if (key === "]") {
    return -1;
  }

  return null;
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
