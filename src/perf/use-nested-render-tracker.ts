/**
 * Records a single leaf render into the non-reactive nested metrics store.
 * Called during the leaf's render body — writing never schedules React work, so
 * it can't perturb the measurement.
 */

import { nestedMetricsStore } from './nested-metrics-store';

function useNestedRenderTracker(tree: number, instanceId: string, styleRef: unknown) {
  nestedMetricsStore.recordRender(tree, instanceId, styleRef);
}

export { useNestedRenderTracker };
