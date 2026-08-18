/**
 * Non-reactive metrics store for the nested-hierarchy screen, keyed by tree.
 * Only leaf nodes consume styles, so only leaf renders are recorded here.
 * Mirrors metrics-store.ts: written during render via a ref counter, never
 * React state, read by the nested dashboard through a throttled subscription.
 */

import { DASHBOARD_THROTTLE_MS, NEST_TREE_LIST } from './constants';
import type { NestedSnapshot, TreeMetrics } from './types';

function createEmptyTree(tree: number): TreeMetrics {
  return {
    tree,
    leafCount: 0,
    renderCount: 0,
    mountCount: 0,
    updateCount: 0,
    wastedRenders: 0,
    commitMs: 0,
  };
}

class NestedMetricsStore {
  private byTree: TreeMetrics[];
  private lastStyleRef: Map<string, unknown>;
  private listeners: Set<() => void>;
  private snapshot: NestedSnapshot;
  private dirty: boolean;
  private emitScheduled: boolean;

  constructor() {
    this.byTree = this.freshTrees();
    this.lastStyleRef = new Map();
    this.listeners = new Set();
    this.dirty = true;
    this.emitScheduled = false;
    this.snapshot = this.buildSnapshot();
  }

  private freshTrees(): TreeMetrics[] {
    const next: TreeMetrics[] = [];
    for (let i = 0; i < NEST_TREE_LIST.length; i++) {
      next.push(createEmptyTree(NEST_TREE_LIST[i]));
    }
    return next;
  }

  recordRender(tree: number, instanceId: string, styleRef: unknown) {
    const metrics = this.byTree[tree];
    const previousRef = this.lastStyleRef.get(instanceId);
    const isMount = previousRef === undefined;

    metrics.renderCount += 1;
    if (isMount) {
      metrics.mountCount += 1;
      metrics.leafCount += 1;
    } else {
      metrics.updateCount += 1;
      if (previousRef === styleRef) {
        metrics.wastedRenders += 1;
      }
    }
    this.lastStyleRef.set(instanceId, styleRef);
    this.markDirty();
  }

  recordDuration(tree: number, durationMs: number) {
    this.byTree[tree].commitMs += durationMs;
    this.markDirty();
  }

  reset() {
    this.byTree = this.freshTrees();
    this.lastStyleRef.clear();
    this.markDirty();
    this.emit();
  }

  getSnapshot = (): NestedSnapshot => {
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

  private buildSnapshot(): NestedSnapshot {
    const byTree: TreeMetrics[] = [];
    for (let i = 0; i < this.byTree.length; i++) {
      byTree.push({ ...this.byTree[i] });
    }
    return { byTree, updatedAt: Date.now() };
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

const nestedMetricsStore = new NestedMetricsStore();

export { nestedMetricsStore };
