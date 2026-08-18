/**
 * Records a single render of a nested node (by variant + part) into the
 * non-reactive nested metrics store. `isMount` (derived from the node's own
 * render counter) splits mounts from updates without retaining per-instance
 * references.
 */

import { nestedMetricsStore } from './nested-metrics-store';
import type { NestPart, NestVariantKey } from './types';

function useNestedRenderTracker(key: NestVariantKey, part: NestPart, isMount: boolean) {
  nestedMetricsStore.recordRender(key, part, isMount);
}

export { useNestedRenderTracker };
