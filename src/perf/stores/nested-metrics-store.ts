/**
 * Non-reactive metrics store for the nested-variation screen. Keyed by tree
 * variant, split into chain vs leaf renders so a theme toggle (which re-renders
 * only where theme is consumed) and a top-level bump (which cascades through
 * non-memoized nodes) can be told apart per variant.
 */

import { DASHBOARD_THROTTLE_MS, NEST_PART, NEST_VARIANT_KEYS } from '../constants';
import type { NestedSnapshot, NestPart, NestVariantKey, VariantMetrics } from '../types';

function createEmptyVariant(key: NestVariantKey): VariantMetrics {
  return {
    key,
    chainCommits: 0,
    leafCommits: 0,
  };
}

class NestedMetricsStore {
  private byVariant: Record<NestVariantKey, VariantMetrics>;
  private listeners: Set<() => void>;
  private snapshot: NestedSnapshot;
  private dirty: boolean;
  private emitScheduled: boolean;

  constructor() {
    this.byVariant = this.freshVariants();
    this.listeners = new Set();
    this.dirty = true;
    this.emitScheduled = false;
    this.snapshot = this.buildSnapshot();
  }

  private freshVariants(): Record<NestVariantKey, VariantMetrics> {
    const next = {} as Record<NestVariantKey, VariantMetrics>;
    for (let i = 0; i < NEST_VARIANT_KEYS.length; i++) {
      const key = NEST_VARIANT_KEYS[i];
      next[key] = createEmptyVariant(key);
    }
    return next;
  }

  recordCommit(key: NestVariantKey, part: NestPart, isMount: boolean) {
    if (isMount) {
      return;
    }
    const metrics = this.byVariant[key];
    if (part === NEST_PART.CHAIN) {
      metrics.chainCommits += 1;
    } else {
      metrics.leafCommits += 1;
    }
    this.markDirty();
  }

  reset() {
    this.byVariant = this.freshVariants();
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
    const byVariant = {} as Record<NestVariantKey, VariantMetrics>;
    for (let i = 0; i < NEST_VARIANT_KEYS.length; i++) {
      const key = NEST_VARIANT_KEYS[i];
      byVariant[key] = { ...this.byVariant[key] };
    }
    return { byVariant, updatedAt: Date.now() };
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
