/**
 * Records a single render of a test component into the non-reactive metrics
 * store. Called during the component's render body — writing to the store never
 * schedules React work, so it cannot perturb the measurement.
 */

import { metricsStore } from './metrics-store';
import type { Category } from './types';

function useRenderTracker(category: Category, instanceId: string, styleRef: unknown) {
  metricsStore.recordRender(category, instanceId, styleRef);
}

export { useRenderTracker };
