import type { CATEGORY, NEST_PART, NEST_VARIANTS } from './constants';

type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

type NestVariantKey = (typeof NEST_VARIANTS)[number]['key'];

type NestPart = (typeof NEST_PART)[keyof typeof NEST_PART];

type RenderPhase = 'mount' | 'update' | 'nested-update';

type CategoryMetrics = {
  category: Category;
  renderCount: number;
  mountCount: number;
  updateCount: number;
  mountDurationMs: number;
  updateDurationMs: number;
  lastRenderAt: number;
};

type MetricsSnapshot = {
  byCategory: Record<Category, CategoryMetrics>;
  totalRenders: number;
  updatedAt: number;
};

type VariantMetrics = {
  key: NestVariantKey;
  chainNodes: number;
  leafNodes: number;
  chainRenders: number;
  leafRenders: number;
};

type NestedSnapshot = {
  byVariant: Record<NestVariantKey, VariantMetrics>;
  updatedAt: number;
};

export type {
  Category,
  NestVariantKey,
  NestPart,
  RenderPhase,
  CategoryMetrics,
  MetricsSnapshot,
  VariantMetrics,
  NestedSnapshot,
};
