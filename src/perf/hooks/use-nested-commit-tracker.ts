/**
 * Counts COMMITS of a nested node (by variant + part) into the nested metrics
 * store. Runs in useEffect (commit phase) rather than the render body, so only
 * committed updates are counted. The first committed effect is the mount (not
 * recorded — the store tracks re-renders only); later ones are updates. Returns
 * the count this paint will reach (commits so far + this one), accurate per
 * painted frame without state.
 */

import { useEffect, useRef } from 'react';

import { nestedMetricsStore } from '../stores/nested-metrics-store';
import type { NestPart, NestVariantKey } from '../types';

function useNestedCommitTracker(key: NestVariantKey, part: NestPart): number {
  const commits = useRef(0);

  useEffect(() => {
    commits.current += 1;
    nestedMetricsStore.recordCommit(key, part, commits.current === 1);
  });

  return commits.current + 1;
}

export { useNestedCommitTracker };
