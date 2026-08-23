/**
 * Control bar for the nested screen. Static react-native StyleSheet with fixed
 * light-theme colors (no theming on this branch).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { lightTheme } from '@/styles/themes';
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

const styles = StyleSheet.create({
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
    backgroundColor: lightTheme.colors.elementActive,
  },
  label: {
    color: lightTheme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export { NestedControls };
