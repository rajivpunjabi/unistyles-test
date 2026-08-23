/**
 * Plain StyleSheet.create with no theme access — the baseline. It has no theme
 * dependency, so in v3 a theme switch should neither re-render nor update it.
 */

import React, { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
    backgroundColor: '#888888',
    borderColor: '#555555',
  },
});

type StaticBoxProps = {
  index: number;
};

function StaticBoxComponent({ index }: StaticBoxProps) {
  const commits = useCommitTracker(CATEGORY.STATIC);

  return (
    <View testID={boxTestId(CATEGORY.STATIC, index)} style={styles.box}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.STATIC]} count={commits} />
    </View>
  );
}

const StaticBox = memo(StaticBoxComponent);

export { StaticBox };
