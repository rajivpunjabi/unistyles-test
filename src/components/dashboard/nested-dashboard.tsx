/**
 * Live per-variant re-render metrics for the nested screen. Columns split chain
 * vs leaf re-renders so a theme toggle (re-renders where theme is consumed) and a
 * bump (cascades through non-memoized nodes) read differently per variant.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { NEST_VARIANTS } from '@/perf/constants';
import { useNestedMetrics } from '@/perf/hooks';

function NestedDashboard() {
  const { styles } = useStyles(stylesheet);
  const metrics = useNestedMetrics();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Commits per variant (chain / leaf)</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.nameCell, styles.headerText]}>variant</Text>
        <Text style={[styles.cell, styles.headerText]}>chain</Text>
        <Text style={[styles.cell, styles.headerText]}>leaf</Text>
      </View>
      {NEST_VARIANTS.map((v) => {
        const m = metrics.byVariant[v.key];
        return (
          <View key={v.key} style={styles.row} testID={`nested-metrics-${v.key}`}>
            <Text style={[styles.cell, styles.nameCell]}>{v.label}</Text>
            <Text style={styles.cell}>{m.chainCommits}</Text>
            <Text style={styles.cell}>{m.leafCommits}</Text>
          </View>
        );
      })}
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    padding: 12,
    gap: 3,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.text,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.text,
  },
  nameCell: {
    flex: 2.4,
    textAlign: 'left',
  },
  headerText: {
    fontWeight: '700',
  },
}));

export { NestedDashboard };
