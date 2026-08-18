/**
 * Reactive store for benchmark control flags. Unlike the metrics store this one
 * intentionally drives re-renders — but through selector subscriptions, so
 * subscribers re-render only when their selected slice changes.
 */

import { useSyncExternalStore } from 'react';

type ControlsState = {
  active: boolean;
};

let state: ControlsState = { active: false };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getState() {
  return state;
}

function toggleActive() {
  state = { ...state, active: !state.active };
  emit();
}

function useControl<T>(selector: (s: ControlsState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

export { getState, toggleActive, useControl };
export type { ControlsState };
