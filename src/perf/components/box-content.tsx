/**
 * In-box overlay showing the category short-code and the box's live render
 * count. Static react-native StyleSheet with fixed light-theme colors.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { lightTheme } from '@/styles/themes';

type BoxContentProps = {
  label: string;
  count: number;
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: lightTheme.colors.background,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: lightTheme.colors.text,
    fontSize: 8,
    fontWeight: '700',
  },
  count: {
    color: lightTheme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

function BoxContent({ label, count }: BoxContentProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

export { BoxContent };
