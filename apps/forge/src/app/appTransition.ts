import type { AppState } from "./appState";

export type SetPointerCaptureEffect = Readonly<{
  kind: "SET_POINTER_CAPTURE";
  pointerId: number;
}>;

export type ReleasePointerCaptureEffect = Readonly<{
  kind: "RELEASE_POINTER_CAPTURE";
  pointerId: number;
}>;

export type PointerCaptureEffect =
  | SetPointerCaptureEffect
  | ReleasePointerCaptureEffect;

export type ShowStatusEffect = Readonly<{
  kind: "SHOW_STATUS";
  message: string;
}>;

export type ClearStatusEffect = Readonly<{
  kind: "CLEAR_STATUS";
}>;

export type AppEffect = Readonly<
  | {
      kind: "SET_POINTER_CAPTURE";
      pointerId: number;
    }
  | {
      kind: "RELEASE_POINTER_CAPTURE";
      pointerId: number;
    }
  | {
      kind: "SHOW_STATUS";
      message: string;
    }
  | {
      kind: "CLEAR_STATUS";
    }
>;

export type AppTransitionHistoryPolicy = "ignore" | "commit";

export type AppTransition = Readonly<{
  state: AppState;
  shouldRender: boolean;
  shouldPreventDefault: boolean;
  history: AppTransitionHistoryPolicy;
  effects: readonly AppEffect[];
}>;

export type AppTransitionInit = Omit<AppTransition, "history" | "effects"> &
  Readonly<{
    history?: AppTransitionHistoryPolicy;
    effects?: readonly AppEffect[];
  }>;

export function transition(value: AppTransitionInit): AppTransition {
  return Object.freeze({
    history: "ignore",
    ...value,
    effects: Object.freeze([...(value.effects ?? [])]),
  });
}

export function unchanged(state: AppState): AppTransition {
  return transition({
    state,
    shouldRender: false,
    shouldPreventDefault: false,
  });
}

export function preventOnly(state: AppState): AppTransition {
  return transition({
    state,
    shouldRender: false,
    shouldPreventDefault: true,
  });
}

export function changed(
  state: AppState,
  history: AppTransitionHistoryPolicy = "ignore",
  statusMessage?: string,
): AppTransition {
  const effects: readonly AppEffect[] | undefined = statusMessage
    ? [
        {
          kind: "SHOW_STATUS",
          message: statusMessage,
        },
      ]
    : undefined;

  return transition({
    state,
    shouldRender: true,
    shouldPreventDefault: true,
    history,
    ...(effects ? { effects } : {}),
  });
}
