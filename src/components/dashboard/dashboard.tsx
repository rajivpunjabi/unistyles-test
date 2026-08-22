/**
 * Live metrics panel. Subscribes to the throttled metrics store and is rendered
 * as a sibling of the grids — never an ancestor — so its own re-renders can
 * never re-render the components it measures.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { CATEGORY_LIST } from '@/perf/constants';
import { useMetrics } from '@/perf/use-metrics';

function Dashboard() {
  const { styles } = useStyles(stylesheet);
  const metrics = useMetrics();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Renders (total: {metrics.totalRenders})</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.nameCell, styles.headerText]}>category</Text>
        <Text style={[styles.cell, styles.headerText]}>rndr</Text>
        <Text style={[styles.cell, styles.headerText]}>upd</Text>
        <Text style={[styles.cell, styles.headerText]}>mnt ms</Text>
        <Text style={[styles.cell, styles.headerText]}>upd ms</Text>
      </View>
      {CATEGORY_LIST.map((category) => {
        const m = metrics.byCategory[category];
        return (
          <View key={category} style={styles.row} testID={`metrics-${category}`}>
            <Text style={[styles.cell, styles.nameCell]}>{category}</Text>
            <Text style={styles.cell}>{m.renderCount}</Text>
            <Text style={styles.cell}>{m.updateCount}</Text>
            <Text style={styles.cell}>{m.mountDurationMs.toFixed(1)}</Text>
            <Text style={styles.cell}>{m.updateDurationMs.toFixed(1)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
    padding: 12,
    gap: 4,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
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
    flex: 2,
    textAlign: 'left',
  },
  headerText: {
    fontWeight: '700',
  },
}));

export { Dashboard };
