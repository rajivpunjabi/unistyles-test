/**
 * Controls hosted on the Home screen: manual theme toggle and variant toggle.
 * Every control carries a stable testID for Maestro.
 */

import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { createStyleSheet, UnistylesRuntime, useStyles } from 'react-native-unistyles';

import { TEST_ID } from '@/perf/constants';
import { toggleColorVariant, useVariantStore } from '@/perf/variant-store';

function Controls() {
  const { styles } = useStyles(stylesheet);
  const [themeName, setThemeName] = useState<string>(UnistylesRuntime.themeName);
  const colorVariant = useVariantStore((s) => s.colorVariant);

  const onToggleTheme = () => {
    UnistylesRuntime.setAdaptiveThemes(false);
    const next = UnistylesRuntime.themeName === 'dark' ? 'light' : 'dark';
    UnistylesRuntime.setTheme(next);
    setThemeName(next);
  };

  return (
    <View style={styles.container}>
      <Pressable testID={TEST_ID.THEME_TOGGLE} style={styles.button} onPress={onToggleTheme}>
        <Text style={styles.label}>Theme: {themeName}</Text>
      </Pressable>

      <Pressable testID={TEST_ID.VARIANT_TOGGLE} style={styles.button} onPress={toggleColorVariant}>
        <Text style={styles.label}>Variant: {colorVariant}</Text>
      </Pressable>
    </View>
  );
}

const stylesheet = createStyleSheet({
  container: {
    gap: 8,
    padding: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2b2f31',
  },
  label: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export { Controls };
