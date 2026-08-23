/**
 * Dynamic function style with NO theme access. The box style is a function
 * called with a per-render argument; per v2 docs it recomputes every render.
 * Isolates the pure dynamic-function cost with no theme involvement.
 */

import React, { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';

const stylesheet = createStyleSheet({
  box: (hue: number) => ({
    width: 60,
    height: 48,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: `hsl(${hue % 360}, 55%, 55%)`,
    backgroundColor: 'red',
  }),
});

type DynamicPlainBoxProps = {
  index: number;
  arg: number;
};

function DynamicPlainBoxComponent({ index, arg }: DynamicPlainBoxProps) {
  const { styles } = useStyles(stylesheet);
  const hue = (index * 7 + arg) % 360;
  const boxStyle = styles.box(hue);
  const commits = useCommitTracker(CATEGORY.DYNAMIC_PLAIN);

  return (
    <View testID={boxTestId(CATEGORY.DYNAMIC_PLAIN, index)} style={boxStyle}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.DYNAMIC_PLAIN]} count={commits} />
    </View>
  );
}

const DynamicPlainBox = memo(DynamicPlainBoxComponent);

export { DynamicPlainBox };
