import React from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { useControl } from '@/perf/controls-store';
import { StaticGrid } from '@/perf/grids/static-grid';

export default function StaticScreen() {
  const { styles } = useStyles(stylesheet);
  const active = useControl((s) => s.active);

  return (
    <View style={styles.screen}>
      <StaticGrid active={active} />
    </View>
  );
}

const stylesheet = createStyleSheet({
  screen: {
    flex: 1,
    paddingTop: 48,
  },
});
