/**
 * Counts COMMITS of a test component into the non-reactive metrics store. The
 * increment runs in useEffect (commit phase), not the render body — so aborted
 * renders and StrictMode double-invokes of render don't inflate it. The first
 * committed effect is the mount; later ones are updates. Returns the count this
 * paint will reach (commits so far + this one) — accurate on every painted frame
 * without state, since an aborted render is never painted and never increments.
 */

import { useEffect, useRef } from 'react';

import { metricsStore } from '../stores/metrics-store';
import type { Category } from '../types';

function useCommitTracker(category: Category): number {
  const commits = useRef(0);

  useEffect(() => {
    commits.current += 1;
    metricsStore.recordCommit(category, commits.current === 1);
  });

  return commits.current + 1;
}

export { useCommitTracker };
