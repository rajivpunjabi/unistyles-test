/**
 * Variant selection with fixed light-theme colors. Variants are composed
 * manually via a style array (react-native has no variants API).
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { lightTheme } from '@/styles/themes';
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
    borderColor: lightTheme.colors.border,
  },
  primary: { backgroundColor: lightTheme.colors.solid },
  muted: { backgroundColor: lightTheme.colors.element },
  small: { width: 56, height: 44 },
  large: { width: 64, height: 52 },
});

type VariantThemedBoxProps = {
  index: number;
};

function VariantThemedBoxComponent({ index }: VariantThemedBoxProps) {
  const colorVariant = useVariantStore((s) => s.colorVariant);
  const commits = useCommitTracker(CATEGORY.VARIANT_THEMED);
  const size = index % 2 === 0 ? 'small' : 'large';

  return (
    <View
      testID={boxTestId(CATEGORY.VARIANT_THEMED, index)}
      style={[styles.box, styles[colorVariant], styles[size]]}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.VARIANT_THEMED]} count={commits} />
    </View>
  );
}

const VariantThemedBox = VariantThemedBoxComponent;

export { VariantThemedBox };
