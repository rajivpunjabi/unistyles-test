import type { CATEGORY } from './constants';

type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

type RenderPhase = 'mount' | 'update' | 'nested-update';

type CategoryMetrics = {
  category: Category;
  renderCount: number;
  mountCount: number;
  updateCount: number;
  mountDurationMs: number;
  updateDurationMs: number;
  lastRenderAt: number;
  wastedRenders: number;
};

type MetricsSnapshot = {
  byCategory: Record<Category, CategoryMetrics>;
  totalRenders: number;
  updatedAt: number;
};

type ThemeSwitchResult = {
  fromTheme: string;
  toTheme: string;
  rerenderedCategories: Category[];
  totalRerenders: number;
  commitDurationMs: number;
};

type RunReport = {
  library: string;
  instanceCount: number;
  startedAt: number;
  finishedAt: number;
  mountSnapshot: MetricsSnapshot;
  themeSwitches: ThemeSwitchResult[];
  finalSnapshot: MetricsSnapshot;
};

export type {
  Category,
  RenderPhase,
  CategoryMetrics,
  MetricsSnapshot,
  ThemeSwitchResult,
  RunReport,
};
