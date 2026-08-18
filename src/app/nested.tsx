import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { createStyleSheet, UnistylesRuntime, useStyles } from 'react-native-unistyles';

import { NestedDashboard } from '@/components/dashboard';
import { NestedTree } from '@/perf/components/nested-node';
import { NEST_TREE_LIST, TEST_ID } from '@/perf/constants';
import { nestedMetricsStore } from '@/perf/nested-metrics-store';
import { NestedProfiler } from '@/perf/nested-profiler';

export default function NestedScreen() {
  const { styles } = useStyles(stylesheet);
  const [bump, setBump] = useState(0);

  const onBump = () => {
    setBump((n) => n + 1);
  };

  const onToggleTheme = () => {
    UnistylesRuntime.setAdaptiveThemes(false);
    const next = UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark';
    UnistylesRuntime.setTheme(next);
  };

  const onReset = () => {
    nestedMetricsStore.reset();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.controls}>
        <Pressable testID={TEST_ID.NESTED_BUMP} style={styles.button} onPress={onBump}>
          <Text style={styles.label}>Bump top-level: {bump}</Text>
        </Pressable>
        <Pressable testID={TEST_ID.NESTED_THEME} style={styles.button} onPress={onToggleTheme}>
          <Text style={styles.label}>Toggle theme</Text>
        </Pressable>
        <Pressable testID={TEST_ID.NESTED_RESET} style={styles.button} onPress={onReset}>
          <Text style={styles.label}>Reset metrics</Text>
        </Pressable>
      </View>

      <NestedDashboard />

      {NEST_TREE_LIST.map((tree) => (
        <View key={tree}>
          <Text style={styles.treeHeader}>Tree {tree} (non-memoized, styles at leaves)</Text>
          <NestedProfiler tree={tree}>
            <NestedTree tree={tree} />
          </NestedProfiler>
        </View>
      ))}
    </ScrollView>
  );
}

const stylesheet = createStyleSheet({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingTop: 48,
    paddingBottom: 120,
  },
  controls: {
    gap: 8,
    padding: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2b2f31',
  },
  label: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  treeHeader: {
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 4,
    marginHorizontal: 8,
    borderRadius: 4,
  },
});
