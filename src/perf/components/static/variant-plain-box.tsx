/**
 * Variant selection with NO theme access: color variants use fixed hex values.
 * Isolates variant-resolution cost with no theme involvement.
 */

import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useCommitTracker } from '../../hooks';
import { useVariantStore } from '../../stores';
import { BoxContent } from '../box-content';

const styles = StyleSheet.create({
  box: {
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#555555',
  },
  primary: { backgroundColor: '#3b6cff' },
  muted: { backgroundColor: '#888888' },
  small: { width: 56, height: 44 },
  large: { width: 64, height: 52 },
});

type VariantPlainBoxProps = {
  index: number;
};

function VariantPlainBoxComponent({ index }: VariantPlainBoxProps) {
  const colorVariant = useVariantStore((s) => s.colorVariant);
  const commits = useCommitTracker(CATEGORY.VARIANT_PLAIN);
  const size = index % 2 === 0 ? 'small' : 'large';

  return (
    <View
      testID={boxTestId(CATEGORY.VARIANT_PLAIN, index)}
      style={[styles.box, styles[colorVariant], styles[size]]}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.VARIANT_PLAIN]} count={commits} />
    </View>
  );
}

const VariantPlainBox = memo(VariantPlainBoxComponent);

export { VariantPlainBox };
