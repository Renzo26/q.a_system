import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "qa-copilot:theme";
const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

let current: Theme = read();

function apply(next: Theme) {
  current = next;
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export const theme = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  get: () => current,
  set: apply,
  toggle: () => apply(current === "dark" ? "light" : "dark"),
};

export function useTheme(): Theme {
  return useSyncExternalStore(
    theme.subscribe,
    () => current,
    () => "dark" as Theme,
  );
}
