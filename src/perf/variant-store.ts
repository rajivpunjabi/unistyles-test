/**
 * Reactive store for the current color variant driving the variant test boxes.
 * Unlike the metrics store this one intentionally drives re-renders — but through
 * selector subscriptions, so subscribers re-render only when their selected slice
 * changes.
 */

import { useSyncExternalStore } from 'react';

type ColorVariant = 'primary' | 'muted';

type VariantState = {
  colorVariant: ColorVariant;
};

let state: VariantState = { colorVariant: 'primary' };
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

function toggleColorVariant() {
  state = { ...state, colorVariant: state.colorVariant === 'primary' ? 'muted' : 'primary' };
  emit();
}

function useVariantStore<T>(selector: (s: VariantState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

export { getState, toggleColorVariant, useVariantStore };
export type { ColorVariant, VariantState };
