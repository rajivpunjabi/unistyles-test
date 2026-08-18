/**
 * Live leaf-render metrics for the nested screen, one row per tree. Isolated
 * sibling of the trees, so its own re-renders never touch the measured leaves.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { useNestedMetrics } from '@/perf/use-nested-metrics';

function NestedDashboard() {
  const { styles } = useStyles(stylesheet);
  const metrics = useNestedMetrics();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaf renders per tree</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.headerText]}>tree</Text>
        <Text style={[styles.cell, styles.headerText]}>leaves</Text>
        <Text style={[styles.cell, styles.headerText]}>renders</Text>
        <Text style={[styles.cell, styles.headerText]}>updates</Text>
        <Text style={[styles.cell, styles.headerText]}>wasted</Text>
        <Text style={[styles.cell, styles.headerText]}>ms</Text>
      </View>
      {metrics.byTree.map((t) => (
        <View key={t.tree} style={styles.row} testID={`nested-metrics-${t.tree}`}>
          <Text style={styles.cell}>T{t.tree}</Text>
          <Text style={styles.cell}>{t.leafCount}</Text>
          <Text style={styles.cell}>{t.renderCount}</Text>
          <Text style={styles.cell}>{t.updateCount}</Text>
          <Text style={styles.cell}>{t.wastedRenders}</Text>
          <Text style={styles.cell}>{t.commitMs.toFixed(1)}</Text>
        </View>
      ))}
    </View>
  );
}

const stylesheet = createStyleSheet({
  container: {
    padding: 12,
    gap: 4,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
    color: '#111111',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#8888',
    paddingBottom: 2,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    color: '#111111',
  },
  headerText: {
    fontWeight: '700',
  },
});

export { NestedDashboard };
