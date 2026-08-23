/**
 * Plain react-native StyleSheet baseline — fixed colors, no theming at all.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

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

const StaticBox = StaticBoxComponent;

export { StaticBox };
