/**
 * Serializes a RunReport to JSON and surfaces it for offline comparison across
 * the v2 and v3 branches: printed to the console and offered via the Share sheet.
 */

import { Share } from 'react-native';

import type { RunReport } from './types';

function toJson(report: RunReport) {
  return JSON.stringify(report, null, 2);
}

async function exportReport(report: RunReport) {
  const json = toJson(report);
  console.log('[unistyles-perf] RunReport\n' + json);
  try {
    await Share.share({ message: json });
  } catch (error) {
    console.warn('[unistyles-perf] share failed', error);
  }
}

export { toJson, exportReport };
