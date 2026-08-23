/**
 * Standard theme-accessing stylesheet: reads colors from the active theme.
 * Expected to re-render on every theme switch.
 */

import React from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';

const stylesheet = createStyleSheet((theme) => ({
  box: {
    width: 60,
    height: 48,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.element,
    borderColor: theme.colors.border,
  },
}));

type ThemedBoxProps = {
  index: number;
};

function ThemedBoxComponent({ index }: ThemedBoxProps) {
  const { styles } = useStyles(stylesheet);
  const commits = useCommitTracker(CATEGORY.THEMED);

  return (
    <View testID={boxTestId(CATEGORY.THEMED, index)} style={styles.box}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.THEMED]} count={commits} />
    </View>
  );
}

const ThemedBox = ThemedBoxComponent;

export { ThemedBox };
