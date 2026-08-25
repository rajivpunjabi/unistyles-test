/**
 * Section label above a tree. Its own useStyles consumer, rendered as a SIBLING
 * of the tree (never wrapping it) so its theme re-render does not cascade into
 * the tree.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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

const styles = StyleSheet.create((theme) => ({
  header: {
    backgroundColor: theme.colors.element,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 4,
    marginHorizontal: 8,
    borderRadius: 4,
  },
  label: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  component: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
}));

export { TreeHeader };
