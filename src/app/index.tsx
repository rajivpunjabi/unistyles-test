import React from 'react';
import { ScrollView } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Controls } from '@/components/controls';
import { Dashboard } from '@/components/dashboard';
import { StaticGrid } from '@/perf/grids/static-grid';
import { useVariantStore } from '@/perf/variant-store';

export default function StaticScreen() {
  const { styles } = useStyles(stylesheet);
  const colorVariant = useVariantStore((s) => s.colorVariant);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Controls />
      <Dashboard />
      <StaticGrid colorVariant={colorVariant} />
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
