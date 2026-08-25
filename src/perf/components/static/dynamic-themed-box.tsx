/**
 * Dynamic function style WITH theme access. Combines a per-render argument with
 * theme colors, so it recomputes on every render and also on every theme switch.
 */

import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';

const styles = StyleSheet.create((theme) => ({
  box: (hue: number) => ({
    width: 60,
    height: 48,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: `hsl(${hue % 360}, 55%, 55%)`,
    backgroundColor: theme.colors.element,
  }),
}));

type DynamicThemedBoxProps = {
  index: number;
  arg: number;
};

function DynamicThemedBoxComponent({ index, arg }: DynamicThemedBoxProps) {
  const hue = (index * 7 + arg) % 360;
  const boxStyle = styles.box(hue);
  const commits = useCommitTracker(CATEGORY.DYNAMIC_THEMED);

  return (
    <View testID={boxTestId(CATEGORY.DYNAMIC_THEMED, index)} style={boxStyle}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.DYNAMIC_THEMED]} count={commits} />
    </View>
  );
}

const DynamicThemedBox = DynamicThemedBoxComponent;

export { DynamicThemedBox };
