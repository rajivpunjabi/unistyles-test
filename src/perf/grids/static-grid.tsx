/**
 * Renders INSTANCE_COUNT of each category, each wrapped in its own Profiler.
 * The main screen for measuring mount cost and theme-switch re-render behavior.
 */

import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import {
  DynamicPlainBox,
  DynamicThemedBox,
  StaticBox,
  ThemedBox,
  VariantPlainBox,
  VariantThemedBox,
} from '../components';
import { CATEGORY, CATEGORY_SHORT, INSTANCE_COUNT } from '../constants';
import { PerfProfiler } from '../perf-profiler';
import type { Category } from '../types';

const INDICES = Array.from({ length: INSTANCE_COUNT }, (_, i) => i);

const SECTION_LABEL: Record<Category, string> = {
  [CATEGORY.STATIC]: 'styles only (no theme)',
  [CATEGORY.THEMED]: 'theme accessed',
  [CATEGORY.DYNAMIC_PLAIN]: 'dynamic function (no theme)',
  [CATEGORY.DYNAMIC_THEMED]: 'dynamic function (theme accessed)',
  [CATEGORY.VARIANT_THEMED]: 'variant (theme accessed)',
  [CATEGORY.VARIANT_PLAIN]: 'variant (no theme)',
};

function SectionHeader({ category }: { category: Category }) {
  const { styles } = useStyles(stylesheet);

  return (
    <Text style={styles.header}>
      {CATEGORY_SHORT[category]} · {SECTION_LABEL[category]}
    </Text>
  );
}

type StaticGridProps = {
  active: boolean;
};

function StaticGrid({ active }: StaticGridProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PerfProfiler category={CATEGORY.STATIC}>
        <SectionHeader category={CATEGORY.STATIC} />
        <View style={styles.section}>
          {INDICES.map((i) => (
            <StaticBox key={i} index={i} />
          ))}
        </View>
      </PerfProfiler>

      <PerfProfiler category={CATEGORY.THEMED}>
        <SectionHeader category={CATEGORY.THEMED} />
        <View style={styles.section}>
          {INDICES.map((i) => (
            <ThemedBox key={i} index={i} />
          ))}
        </View>
      </PerfProfiler>

      <PerfProfiler category={CATEGORY.DYNAMIC_PLAIN}>
        <SectionHeader category={CATEGORY.DYNAMIC_PLAIN} />
        <View style={styles.section}>
          {INDICES.map((i) => (
            <DynamicPlainBox key={i} index={i} arg={i} />
          ))}
        </View>
      </PerfProfiler>

      <PerfProfiler category={CATEGORY.DYNAMIC_THEMED}>
        <SectionHeader category={CATEGORY.DYNAMIC_THEMED} />
        <View style={styles.section}>
          {INDICES.map((i) => (
            <DynamicThemedBox key={i} index={i} arg={i} />
          ))}
        </View>
      </PerfProfiler>

      <PerfProfiler category={CATEGORY.VARIANT_THEMED}>
        <SectionHeader category={CATEGORY.VARIANT_THEMED} />
        <View style={styles.section}>
          {INDICES.map((i) => (
            <VariantThemedBox key={i} index={i} active={active} />
          ))}
        </View>
      </PerfProfiler>

      <PerfProfiler category={CATEGORY.VARIANT_PLAIN}>
        <SectionHeader category={CATEGORY.VARIANT_PLAIN} />
        <View style={styles.section}>
          {INDICES.map((i) => (
            <VariantPlainBox key={i} index={i} active={active} />
          ))}
        </View>
      </PerfProfiler>
    </ScrollView>
  );
}

const stylesheet = createStyleSheet({
  content: {
    padding: 8,
    paddingBottom: 120,
  },
  section: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  header: {
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.7)',
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
