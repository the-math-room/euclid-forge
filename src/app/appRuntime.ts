import type { AppTransition } from "./appController";
import {
  appStateFromHistory,
  commitHistory,
  redoHistory,
  undoHistory,
} from "./history";
import type { HistoryState } from "./history";
import { applyTransition } from "./transitionEffects";
import type { AppState } from "./appState";
import type { StatusSurface } from "./statusSurface";

export type AppRuntime = Readonly<{
  getState: () => AppState;
  setState: (state: AppState) => void;
  getHistory: () => HistoryState;
  setHistory: (history: HistoryState) => void;
  applyTransition: (event: Event, transition: AppTransition) => void;
  undo: (event: Event) => void;
  redo: (event: Event) => void;
  requestRender: () => void;
}>;

export type AppRuntimeInput = Readonly<{
  canvas: HTMLCanvasElement;
  initialState: AppState;
  initialHistory: HistoryState;
  requestRender: () => void;
  statusSurface: StatusSurface;
}>;

export function createAppRuntime(input: AppRuntimeInput): AppRuntime {
  let state = input.initialState;
  let history = input.initialHistory;

  const setState = (next: AppState): void => {
    state = next;
  };

  const setHistory = (next: HistoryState): void => {
    history = next;
  };

  const commitStateToHistory = (next: AppState): void => {
    history = commitHistory(history, next);
  };

  return Object.freeze({
    getState(): AppState {
      return state;
    },

    setState,

    getHistory(): HistoryState {
      return history;
    },

    setHistory,

    applyTransition(event: Event, transition: AppTransition): void {
      applyTransition({
        canvas: input.canvas,
        event,
        transition,
        setState,
        requestRender: input.requestRender,
        commitStateToHistory,
        showStatusMessage: (message) => {
          if (message) {
            input.statusSurface.show(message);
          }
        },
      });
    },

    undo(event: Event): void {
      history = undoHistory(history);
      state = appStateFromHistory(history);
      input.requestRender();
      event.preventDefault();
    },

    redo(event: Event): void {
      history = redoHistory(history);
      state = appStateFromHistory(history);
      input.requestRender();
      event.preventDefault();
    },

    requestRender: input.requestRender,
  });
}
