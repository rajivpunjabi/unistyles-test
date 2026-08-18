/**
 * Subscribes the nested dashboard to the nested metrics store. Emits are
 * throttled inside the store, so this re-renders only the dashboard subtree.
 */

import { useSyncExternalStore } from 'react';

import { nestedMetricsStore } from './nested-metrics-store';

function useNestedMetrics() {
  return useSyncExternalStore(nestedMetricsStore.subscribe, nestedMetricsStore.getSnapshot);
}

export { useNestedMetrics };
