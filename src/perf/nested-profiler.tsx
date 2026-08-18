/**
 * Wraps a nested tree in a React <Profiler> and forwards commit durations into
 * the nested metrics store, keyed by tree index.
 */

import React, { Profiler, type ReactNode } from 'react';

import { nestedMetricsStore } from './nested-metrics-store';

type NestedProfilerProps = {
  tree: number;
  children: ReactNode;
};

function NestedProfiler({ tree, children }: NestedProfilerProps) {
  const onRender: React.ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
    nestedMetricsStore.recordDuration(tree, actualDuration);
  };

  return (
    <Profiler id={`tree-${tree}`} onRender={onRender}>
      {children}
    </Profiler>
  );
}

export { NestedProfiler };
