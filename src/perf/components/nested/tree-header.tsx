/**
 * Section label above a tree. Static react-native StyleSheet with fixed
 * light-theme colors (no theming).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { lightTheme } from '@/styles/themes';

type TreeHeaderProps = {
  label: string;
  component: string;
};

function TreeHeader({ label, component }: TreeHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.component}>{`<${component} />`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: lightTheme.colors.element,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 4,
    marginHorizontal: 8,
    borderRadius: 4,
  },
  label: {
    color: lightTheme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  component: {
    color: lightTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});

export { TreeHeader };
