/**
 * Static react-native StyleSheet with fixed light-theme colors (no theming).
 */

import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { lightTheme } from '@/styles/themes';
import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';

const styles = StyleSheet.create({
  box: {
    width: 60,
    height: 48,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightTheme.colors.element,
    borderColor: lightTheme.colors.border,
  },
});

type ThemedBoxProps = {
  index: number;
};

function ThemedBoxComponent({ index }: ThemedBoxProps) {
  const commits = useCommitTracker(CATEGORY.THEMED);

  return (
    <View testID={boxTestId(CATEGORY.THEMED, index)} style={styles.box}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.THEMED]} count={commits} />
    </View>
  );
}

const ThemedBox = memo(ThemedBoxComponent);

export { ThemedBox };
