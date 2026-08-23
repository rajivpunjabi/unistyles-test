/**
 * Control bar for the nested screen. Its own useStyles consumer so the screen
 * (the trees' parent) doesn't have to be — a themed screen would re-render on
 * every theme toggle and cascade into the non-memoized trees. As a sibling of
 * the trees, this component's theme re-render stays contained.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { TEST_ID } from '../../constants';

type NestedControlsProps = {
  bump: number;
  onToggleTheme: () => void;
  onBump: () => void;
  onReset: () => void;
};

function NestedControls({ bump, onToggleTheme, onBump, onReset }: NestedControlsProps) {
  return (
    <View style={styles.controls}>
      <Pressable testID={TEST_ID.NESTED_THEME} style={styles.button} onPress={onToggleTheme}>
        <Text style={styles.label}>Toggle theme</Text>
      </Pressable>
      <Pressable testID={TEST_ID.NESTED_BUMP} style={styles.button} onPress={onBump}>
        <Text style={styles.label}>Bump top: {bump}</Text>
      </Pressable>
      <Pressable testID={TEST_ID.NESTED_RESET} style={styles.button} onPress={onReset}>
        <Text style={styles.label}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.elementActive,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
}));

export { NestedControls };
