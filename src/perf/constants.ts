/**
 * Shared constants for the unistyles performance harness.
 *
 * Every domain string (category names, testIDs) is defined here once so the
 * v2 and v3 branches — and the Maestro flow — reference identical identifiers.
 */

const CATEGORY = {
  STATIC: "static",
  THEMED: "themed",
  DYNAMIC_PLAIN: "dynamic-plain",
  DYNAMIC_THEMED: "dynamic-themed",
  VARIANT_THEMED: "variant-themed",
  VARIANT_PLAIN: "variant-plain",
} as const;

const CATEGORY_LIST = [
  CATEGORY.STATIC,
  CATEGORY.THEMED,
  CATEGORY.DYNAMIC_PLAIN,
  CATEGORY.DYNAMIC_THEMED,
  CATEGORY.VARIANT_THEMED,
  CATEGORY.VARIANT_PLAIN,
] as const;

const CATEGORY_SHORT = {
  [CATEGORY.STATIC]: "STC",
  [CATEGORY.THEMED]: "THM",
  [CATEGORY.DYNAMIC_PLAIN]: "DYN",
  [CATEGORY.DYNAMIC_THEMED]: "DYN+T",
  [CATEGORY.VARIANT_THEMED]: "VAR+T",
  [CATEGORY.VARIANT_PLAIN]: "VAR",
} as const;

const INSTANCE_COUNT = 20;

const THEME_TOGGLE_COUNT = 5;

const THEME_TOGGLE_DELAY_MS = 600;

const DASHBOARD_THROTTLE_MS = 250;

const TEST_ID = {
  THEME_TOGGLE: "control-theme-toggle",
  RUN_BENCHMARK: "control-run-benchmark",
  VARIANT_TOGGLE: "control-variant-toggle",
  TAB_HOME: "tab-home",
  TAB_STATIC: "tab-static",
  REPORT_OUTPUT: "report-output",
} as const;

function boxTestId(category: string, index: number) {
  return `${category}-${index}`;
}

export {
  boxTestId,
  CATEGORY,
  CATEGORY_LIST,
  CATEGORY_SHORT,
  DASHBOARD_THROTTLE_MS,
  INSTANCE_COUNT,
  TEST_ID,
  THEME_TOGGLE_COUNT,
  THEME_TOGGLE_DELAY_MS,
};
