import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Controls } from '@/components/controls';
import { Dashboard } from '@/components/dashboard';
import { StaticGrid } from '@/perf/grids/static-grid';

/**
 * Bump is an unrelated counter held at the screen root and NOT passed to the
 * grid — re-rendering the screen. The memoized boxes get identical props and
 * should skip, so the dashboard shows ~0 box commits on bump (isolation check).
 */
export default function StaticScreen() {
  const { styles } = useStyles(stylesheet);
  const [bump, setBump] = useState(0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Controls bump={bump} onBump={() => setBump((n) => n + 1)} />
      <Dashboard />
      <StaticGrid />
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
});
