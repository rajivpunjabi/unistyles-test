/**
 * In-box overlay showing the category short-code and the box's live render
 * count. Rendered in a themed pill so it stays legible on any theme background.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

type BoxContentProps = {
  label: string;
  count: number;
};

const stylesheet = createStyleSheet((theme) => ({
  pill: {
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: theme.colors.text,
    fontSize: 8,
    fontWeight: '700',
  },
  count: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
}));

function BoxContent({ label, count }: BoxContentProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

export { BoxContent };
