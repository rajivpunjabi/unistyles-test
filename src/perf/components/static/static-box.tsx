/**
 * Plain createStyleSheet with no theme access — the baseline. Even though it
 * reads nothing from the theme, it still goes through useStyles, so this proves
 * whether v2 re-renders theme-agnostic components on a theme switch.
 */

import React, { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';

const stylesheet = createStyleSheet({
  box: {
    width: 60,
    height: 48,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#888888',
    borderColor: '#555555',
  },
});

type StaticBoxProps = {
  index: number;
};

function StaticBoxComponent({ index }: StaticBoxProps) {
  const { styles } = useStyles(stylesheet);
  const commits = useCommitTracker(CATEGORY.STATIC);

  return (
    <View testID={boxTestId(CATEGORY.STATIC, index)} style={styles.box}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.STATIC]} count={commits} />
    </View>
  );
}

const StaticBox = memo(StaticBoxComponent);

export { StaticBox };
