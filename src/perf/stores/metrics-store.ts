/**
 * Non-reactive singleton metrics store.
 *
 * Test components record a COMMIT into it from useEffect (commit phase), not
 * render — so discarded renders and StrictMode double-invokes don't inflate the
 * count. It never holds React state, so recording can't itself trigger a render.
 * The dashboard reads it through useSyncExternalStore with throttled emits so
 * the meter never disturbs what it measures.
 */

import { CATEGORY_LIST, DASHBOARD_THROTTLE_MS } from '../constants';
import type { Category, CategoryMetrics, MetricsSnapshot, RenderPhase } from '../types';

function createEmptyCategory(category: Category): CategoryMetrics {
  return {
    category,
    commitCount: 0,
    mountCount: 0,
    updateCount: 0,
    mountDurationMs: 0,
    updateDurationMs: 0,
    lastCommitAt: 0,
  };
}

class MetricsStore {
  private byCategory: Record<Category, CategoryMetrics>;
  private listeners: Set<() => void>;
  private snapshot: MetricsSnapshot;
  private dirty: boolean;
  private emitScheduled: boolean;

  constructor() {
    this.byCategory = this.freshCategories();
    this.listeners = new Set();
    this.dirty = true;
    this.emitScheduled = false;
    this.snapshot = this.buildSnapshot();
  }

  private freshCategories(): Record<Category, CategoryMetrics> {
    const next = {} as Record<Category, CategoryMetrics>;
    for (let i = 0; i < CATEGORY_LIST.length; i++) {
      const category = CATEGORY_LIST[i];
      next[category] = createEmptyCategory(category);
    }
    return next;
  }

  recordCommit(category: Category, isMount: boolean) {
    const metrics = this.byCategory[category];

    metrics.commitCount += 1;
    metrics.lastCommitAt = Date.now();
    if (isMount) {
      metrics.mountCount += 1;
    } else {
      metrics.updateCount += 1;
    }
    this.markDirty();
  }

  recordDuration(category: Category, phase: RenderPhase, durationMs: number) {
    const metrics = this.byCategory[category];
    if (phase === 'mount') {
      metrics.mountDurationMs += durationMs;
    } else {
      metrics.updateDurationMs += durationMs;
    }
    this.markDirty();
  }

  reset() {
    this.byCategory = this.freshCategories();
    this.markDirty();
    this.emit();
  }

  getSnapshot = (): MetricsSnapshot => {
    if (this.dirty) {
      this.snapshot = this.buildSnapshot();
      this.dirty = false;
    }
    return this.snapshot;
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private buildSnapshot(): MetricsSnapshot {
    const byCategory = {} as Record<Category, CategoryMetrics>;
    let totalCommits = 0;
    for (let i = 0; i < CATEGORY_LIST.length; i++) {
      const category = CATEGORY_LIST[i];
      const metrics = this.byCategory[category];
      byCategory[category] = { ...metrics };
      totalCommits += metrics.commitCount;
    }
    return { byCategory, totalCommits, updatedAt: Date.now() };
  }

  private markDirty() {
    this.dirty = true;
    this.scheduleEmit();
  }

  private scheduleEmit() {
    if (this.emitScheduled) {
      return;
    }
    this.emitScheduled = true;
    setTimeout(() => {
      this.emitScheduled = false;
      this.emit();
    }, DASHBOARD_THROTTLE_MS);
  }

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

const metricsStore = new MetricsStore();

export { metricsStore };
