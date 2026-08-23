/**
 * Wraps a category's grid in a React <Profiler> and forwards commit durations
 * (split by mount vs update phase) into the metrics store.
 */

import React, { Profiler, type ReactNode } from 'react';

import { metricsStore } from './stores/metrics-store';
import type { Category } from './types';

type PerfProfilerProps = {
  category: Category;
  children: ReactNode;
};

function PerfProfiler({ category, children }: PerfProfilerProps) {
  const onRender: React.ProfilerOnRenderCallback = (_id, phase, actualDuration) => {
    metricsStore.recordDuration(category, phase, actualDuration);
  };

  return (
    <Profiler id={category} onRender={onRender}>
      {children}
    </Profiler>
  );
}

export { PerfProfiler };
