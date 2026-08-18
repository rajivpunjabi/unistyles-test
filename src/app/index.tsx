import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Controls } from '@/components/controls';
import { Dashboard } from '@/components/dashboard';
import { runBenchmark } from '@/perf/benchmark';
import { TEST_ID } from '@/perf/constants';
import { exportReport, toJson } from '@/perf/export';

export default function HomeScreen() {
  const { styles } = useStyles(stylesheet);
  const [running, setRunning] = useState(false);
  const [reportJson, setReportJson] = useState('');

  const onRunBenchmark = async () => {
    setRunning(true);
    try {
      const report = await runBenchmark();
      setReportJson(toJson(report));
      await exportReport(report);
    } finally {
      setRunning(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Controls running={running} onRunBenchmark={onRunBenchmark} />
      <Dashboard />
      <Text testID={TEST_ID.REPORT_OUTPUT} style={styles.report} selectable>
        {reportJson}
      </Text>
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
  report: {
    padding: 12,
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333333',
  },
});
