/**
 * Records a single render of a nested node (by variant + part) into the
 * non-reactive nested metrics store. Called during the node's render body.
 */

import { nestedMetricsStore } from './nested-metrics-store';
import type { NestPart, NestVariantKey } from './types';

function useNestedRenderTracker(
  key: NestVariantKey,
  part: NestPart,
  instanceId: string,
  styleRef: unknown,
) {
  nestedMetricsStore.recordRender(key, part, instanceId, styleRef);
}

export { useNestedRenderTracker };
