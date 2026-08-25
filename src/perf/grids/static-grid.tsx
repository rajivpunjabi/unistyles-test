/**
 * Renders INSTANCE_COUNT of each category, each wrapped in its own Profiler.
 * The main screen for measuring mount cost and theme-switch re-render behavior.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  DynamicPlainBox,
  DynamicThemedBox,
  StaticBox,
  ThemedBox,
  VariantPlainBox,
  VariantThemedBox,
} from '../components';
import { CATEGORY, CATEGORY_LIST, CATEGORY_SHORT, INSTANCE_COUNT } from '../constants';
import { PerfProfiler } from '../perf-profiler';
import type { Category } from '../types';
import { lightTheme } from '@/styles/themes';

const INDICES = Array.from({ length: INSTANCE_COUNT }, (_, i) => i);

const SECTION_LABEL: Record<Category, string> = {
  [CATEGORY.STATIC]: 'styles only (no theme)',
  [CATEGORY.THEMED]: 'theme accessed',
  [CATEGORY.DYNAMIC_PLAIN]: 'dynamic function (no theme)',
  [CATEGORY.DYNAMIC_THEMED]: 'dynamic function (theme accessed)',
  [CATEGORY.VARIANT_THEMED]: 'variant (theme accessed)',
  [CATEGORY.VARIANT_PLAIN]: 'variant (no theme)',
};

const BOX_BY_CATEGORY: Record<Category, (index: number) => React.ReactNode> = {
  [CATEGORY.STATIC]: (i) => <StaticBox key={i} index={i} />,
  [CATEGORY.THEMED]: (i) => <ThemedBox key={i} index={i} />,
  [CATEGORY.DYNAMIC_PLAIN]: (i) => <DynamicPlainBox key={i} index={i} arg={i} />,
  [CATEGORY.DYNAMIC_THEMED]: (i) => <DynamicThemedBox key={i} index={i} arg={i} />,
  [CATEGORY.VARIANT_PLAIN]: (i) => <VariantPlainBox key={i} index={i} />,
  [CATEGORY.VARIANT_THEMED]: (i) => <VariantThemedBox key={i} index={i} />,
};

function SectionHeader({ category }: { category: Category }) {
  return (
    <Text style={styles.header}>
      {CATEGORY_SHORT[category]} · {SECTION_LABEL[category]}
    </Text>
  );
}

function StaticGrid() {
  return (
    <View style={styles.content}>
      {CATEGORY_LIST.map((category) => (
        <PerfProfiler key={category} category={category}>
          <SectionHeader category={category} />
          <View style={styles.section}>{INDICES.map((i) => BOX_BY_CATEGORY[category](i))}</View>
        </PerfProfiler>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 8,
    paddingBottom: 120,
    backgroundColor: lightTheme.colors.background,
  },
  section: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  header: {
    color: lightTheme.colors.text,
    backgroundColor: lightTheme.colors.element,
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 4,
  },
});

export { StaticGrid };
