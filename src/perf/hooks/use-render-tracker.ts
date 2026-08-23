/**
 * Records a single render of a test component into the non-reactive metrics
 * store. Called during the component's render body — writing never schedules
 * React work, so it cannot perturb the measurement. `isMount` (derived from the
 * component's own render counter) splits mounts from updates without the store
 * retaining any per-instance references.
 */

import { metricsStore } from '../stores/metrics-store';
import type { Category } from '../types';

function useRenderTracker(category: Category, isMount: boolean) {
  metricsStore.recordRender(category, isMount);
}

export { useRenderTracker };
