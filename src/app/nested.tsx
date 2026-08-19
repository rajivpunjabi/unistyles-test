import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { UnistylesRuntime } from 'react-native-unistyles';

import { NestedDashboard } from '@/components/dashboard';
import { NESTED_TREE_BY_KEY, NestedControls, TreeHeader } from '@/perf/components/nested';
import { NEST_VARIANTS } from '@/perf/constants';
import { nestedMetricsStore } from '@/perf/nested-metrics-store';

/**
 * The screen itself is NOT a useStyles consumer: chrome (controls, tree headers,
 * dashboard) lives in child components that each consume useStyles, so a theme
 * toggle re-renders only those siblings — never this screen, whose re-render
 * would cascade into the non-memoized trees. Bump re-renders the screen via
 * setState on purpose (its cascade is the thing being measured).
 */
export default function NestedScreen() {
  const [bump, setBump] = useState(0);

  const onToggleTheme = () => {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <NestedControls
        bump={bump}
        onToggleTheme={onToggleTheme}
        onBump={() => setBump((n) => n + 1)}
        onReset={() => nestedMetricsStore.reset()}
      />

      <NestedDashboard />

      {NEST_VARIANTS.map(({ key, label }) => {
        const Tree = NESTED_TREE_BY_KEY[key];
        return (
          <View key={key}>
            <TreeHeader label={label} />
            {/* Hidden from a11y so Maestro doesn't traverse the tree nodes. */}
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Tree />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingTop: 48,
    paddingBottom: 120,
  },
});
