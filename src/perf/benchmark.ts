/**
 * Deterministic, scripted benchmark. Runs the same sequence every time so a
 * Maestro flow (and Flashlight) can replay it identically on the v2 and v3
 * branches. Produces a RunReport and hands it to the caller for display/export.
 */

import { router } from 'expo-router';
import { UnistylesRuntime } from 'react-native-unistyles';

import {
  CATEGORY_LIST,
  INSTANCE_COUNT,
  THEME_TOGGLE_COUNT,
  THEME_TOGGLE_DELAY_MS,
} from './constants';
import { metricsStore } from './metrics-store';
import type { Category, MetricsSnapshot, RunReport, ThemeSwitchResult } from './types';

const LIBRARY = 'react-native-unistyles@2';
const SETTLE_MS = 800;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function diffThemeSwitch(
  before: MetricsSnapshot,
  after: MetricsSnapshot,
  fromTheme: string,
  toTheme: string,
): ThemeSwitchResult {
  const rerenderedCategories: Category[] = [];
  let totalRerenders = 0;
  let commitDurationMs = 0;

  for (let i = 0; i < CATEGORY_LIST.length; i++) {
    const category = CATEGORY_LIST[i];
    const beforeMetrics = before.byCategory[category];
    const afterMetrics = after.byCategory[category];
    const renderDelta = afterMetrics.renderCount - beforeMetrics.renderCount;
    if (renderDelta > 0) {
      rerenderedCategories.push(category);
      totalRerenders += renderDelta;
    }
    commitDurationMs += afterMetrics.updateDurationMs - beforeMetrics.updateDurationMs;
  }

  return { fromTheme, toTheme, rerenderedCategories, totalRerenders, commitDurationMs };
}

async function runBenchmark(): Promise<RunReport> {
  UnistylesRuntime.setAdaptiveThemes(false);
  metricsStore.reset();
  const startedAt = Date.now();

  router.push('/static');
  await delay(SETTLE_MS);
  const mountSnapshot = metricsStore.getSnapshot();

  const themeSwitches: ThemeSwitchResult[] = [];
  for (let i = 0; i < THEME_TOGGLE_COUNT; i++) {
    const fromTheme = UnistylesRuntime.themeName;
    const toTheme = fromTheme === 'dark' ? 'light' : 'dark';
    const before = metricsStore.getSnapshot();
    UnistylesRuntime.setTheme(toTheme);
    await delay(THEME_TOGGLE_DELAY_MS);
    const after = metricsStore.getSnapshot();
    themeSwitches.push(diffThemeSwitch(before, after, fromTheme, toTheme));
  }

  const finalSnapshot = metricsStore.getSnapshot();

  const report: RunReport = {
    library: LIBRARY,
    instanceCount: INSTANCE_COUNT,
    startedAt,
    finishedAt: Date.now(),
    mountSnapshot,
    themeSwitches,
    finalSnapshot,
  };

  return report;
}

export { runBenchmark };
