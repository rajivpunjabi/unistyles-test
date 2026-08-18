/**
 * Subscribes the dashboard to the metrics store. Emits are throttled inside the
 * store, so this hook re-renders only the dashboard subtree, never the grids.
 */

import { useSyncExternalStore } from "react";

import { metricsStore } from "./metrics-store";

function useMetrics() {
  return useSyncExternalStore(metricsStore.subscribe, metricsStore.getSnapshot);
}

export { useMetrics };
