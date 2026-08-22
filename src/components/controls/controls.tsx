/**
 * Controls hosted on the Home screen: manual theme toggle and variant toggle.
 * Every control carries a stable testID for Maestro.
 */

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyleSheet, UnistylesRuntime, useStyles } from 'react-native-unistyles';

import { TEST_ID } from '@/perf/constants';
import { toggleColorVariant, useVariantStore } from '@/perf/variant-store';

function Controls() {
  const { styles } = useStyles(stylesheet);
  const colorVariant = useVariantStore((s) => s.colorVariant);

  const onToggleTheme = () => {
    UnistylesRuntime.setTheme(UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={styles.container}>
      <Pressable testID={TEST_ID.THEME_TOGGLE} style={styles.button} onPress={onToggleTheme}>
        <Text style={styles.label}>Toggle theme</Text>
      </Pressable>

      <Pressable testID={TEST_ID.VARIANT_TOGGLE} style={styles.button} onPress={toggleColorVariant}>
        <Text style={styles.label}>Variant: {colorVariant}</Text>
      </Pressable>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  container: {
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

export { Controls };
