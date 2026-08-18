/**
 * Non-reactive metrics store for the nested-variation screen. Keyed by tree
 * variant, split into chain vs leaf renders so a theme toggle (which re-renders
 * only where theme is consumed) and a top-level bump (which cascades through
 * non-memoized nodes) can be told apart per variant.
 */

import { DASHBOARD_THROTTLE_MS, NEST_PART, NEST_VARIANT_KEYS } from './constants';
import type { NestedSnapshot, NestPart, NestVariantKey, VariantMetrics } from './types';

function createEmptyVariant(key: NestVariantKey): VariantMetrics {
  return {
    key,
    chainNodes: 0,
    leafNodes: 0,
    chainRenders: 0,
    leafRenders: 0,
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

  recordRender(key: NestVariantKey, part: NestPart, isMount: boolean) {
    const metrics = this.byVariant[key];
    const isChain = part === NEST_PART.CHAIN;

    if (isMount) {
      if (isChain) {
        metrics.chainNodes += 1;
      } else {
        metrics.leafNodes += 1;
      }
    } else if (isChain) {
      metrics.chainRenders += 1;
    } else {
      metrics.leafRenders += 1;
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
