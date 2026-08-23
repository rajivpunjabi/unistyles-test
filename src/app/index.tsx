import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Controls } from '@/components/controls';
import { Dashboard } from '@/components/dashboard';
import { StaticGrid } from '@/perf/grids/static-grid';

export default function StaticScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Controls />
      <Dashboard />
      <StaticGrid />
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
