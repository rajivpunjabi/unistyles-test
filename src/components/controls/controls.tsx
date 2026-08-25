/**
 * Controls hosted on the Home screen: manual theme toggle and variant toggle.
 * Every control carries a stable testID for Maestro.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TEST_ID } from '@/perf/constants';
import { toggleColorVariant, useVariantStore } from '@/perf/stores';
import { lightTheme } from '@/styles/themes';

type ControlsProps = {
  bump: number;
  onBump: () => void;
};

function Controls({ bump, onBump }: ControlsProps) {
  const colorVariant = useVariantStore((s) => s.colorVariant);

  // No theming on this branch (static light styles) — the toggle is a no-op,
  // kept only so the shared Maestro flow's testID still resolves.
  const onToggleTheme = () => {};

  return (
    <View style={styles.container}>
      <Pressable testID={TEST_ID.THEME_TOGGLE} style={styles.button} onPress={onToggleTheme}>
        <Text style={styles.label}>Toggle theme</Text>
      </Pressable>

      <Pressable testID={TEST_ID.VARIANT_TOGGLE} style={styles.button} onPress={toggleColorVariant}>
        <Text style={styles.label}>Variant: {colorVariant}</Text>
      </Pressable>

      <Pressable testID={TEST_ID.STATIC_BUMP} style={styles.button} onPress={onBump}>
        <Text style={styles.label}>Bump: {bump}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

export { Controls };
