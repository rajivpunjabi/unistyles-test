/**
 * Shared constants for the unistyles performance harness.
 *
 * Every domain string (category names, roles, testIDs) is defined here once so
 * the v2 and v3 branches — and the Maestro flow — reference identical identifiers.
 */

const CATEGORY = {
  STATIC: 'static',
  THEMED: 'themed',
  DYNAMIC_PLAIN: 'dynamic-plain',
  DYNAMIC_THEMED: 'dynamic-themed',
  VARIANT_THEMED: 'variant-themed',
  VARIANT_PLAIN: 'variant-plain',
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
  [CATEGORY.STATIC]: 'STC',
  [CATEGORY.THEMED]: 'THM',
  [CATEGORY.DYNAMIC_PLAIN]: 'DYN',
  [CATEGORY.DYNAMIC_THEMED]: 'DYN+T',
  [CATEGORY.VARIANT_THEMED]: 'VAR+T',
  [CATEGORY.VARIANT_PLAIN]: 'VAR',
} as const;

const INSTANCE_COUNT = 100;

/**
 * Nested trees: a full binary tree — 1 -> 2 -> 4 -> 8 nodes (depth 4). Intermediate
 * levels (0..2, "chain") each have NEST_BRANCHING children; the last level (3) are
 * the leaves. We render THEME PLACEMENT x MEMO so we can isolate the two drivers:
 *  - theme toggle  -> re-renders wherever theme is CONSUMED (placement); memo
 *    is irrelevant (the useStyles subscription re-renders the component itself).
 *  - top-level bump -> cascades through NON-memoized nodes; placement irrelevant.
 * In v3 the theme toggle re-renders nothing in any arrangement (ShadowTree update).
 */
const NEST_DEPTH = 4;

const NEST_BRANCHING = 2;

const NEST_PART = {
  CHAIN: 'chain',
  LEAF: 'leaf',
} as const;

/**
 * The three distinct theme-toggle outcomes (v2), each its own tree component.
 * Redundant arrangements are dropped: cascade is downward-only, so a high theme
 * consumer without memo re-renders everything below it, and memo below a leaf
 * consumer does nothing.
 *  - all-no-memo : themed chain cascades -> every node re-renders (baseline)
 *  - parent-memo : themed chain, memo'd plain leaves spared -> chain only
 *  - leaf-no-memo: leaf-only consumer, no upward cascade -> leaves only
 * On v3 the theme column is 0 for all three (ShadowTree update, no re-render).
 */
const NEST_VARIANTS = [
  { key: 'all-no-memo', label: 'styles: chain+leaf · memo: none' },
  { key: 'parent-memo', label: 'styles: chain only · memo: all nodes' },
  { key: 'leaf-no-memo', label: 'styles: leaf only · memo: none' },
] as const;

const NEST_VARIANT_KEYS = NEST_VARIANTS.map((v) => v.key);

const THEME_TOGGLE_COUNT = 5;

const THEME_TOGGLE_DELAY_MS = 600;

const DASHBOARD_THROTTLE_MS = 250;

const TEST_ID = {
  THEME_TOGGLE: 'control-theme-toggle',
  RUN_BENCHMARK: 'control-run-benchmark',
  VARIANT_TOGGLE: 'control-variant-toggle',
  TAB_HOME: 'tab-home',
  TAB_STATIC: 'tab-static',
  TAB_NESTED: 'tab-nested',
  NESTED_THEME: 'nested-theme',
  NESTED_BUMP: 'nested-bump',
  NESTED_RESET: 'nested-reset',
  REPORT_OUTPUT: 'report-output',
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
  NEST_BRANCHING,
  NEST_DEPTH,
  NEST_PART,
  NEST_VARIANT_KEYS,
  NEST_VARIANTS,
  TEST_ID,
  THEME_TOGGLE_COUNT,
  THEME_TOGGLE_DELAY_MS,
};
