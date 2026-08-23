/**
 * Variant selection WITH theme access: color variants map to theme colors,
 * selected through the second argument of useStyles. `active` flips the color
 * variant so variant-change re-renders can be measured.
 */

import React, { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useCommitTracker } from '../../hooks';
import { useVariantStore } from '../../stores';
import { BoxContent } from '../box-content';

const stylesheet = createStyleSheet((theme) => ({
  box: {
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: theme.colors.border,
    variants: {
      color: {
        primary: { backgroundColor: theme.colors.solid },
        muted: { backgroundColor: theme.colors.element },
      },
      size: {
        small: { width: 56, height: 44 },
        large: { width: 64, height: 52 },
      },
    },
  },
}));

type VariantThemedBoxProps = {
  index: number;
};

function VariantThemedBoxComponent({ index }: VariantThemedBoxProps) {
  const colorVariant = useVariantStore((s) => s.colorVariant);
  const { styles } = useStyles(stylesheet, {
    color: colorVariant,
    size: index % 2 === 0 ? 'small' : 'large',
  });
  const commits = useCommitTracker(CATEGORY.VARIANT_THEMED);

  return (
    <View testID={boxTestId(CATEGORY.VARIANT_THEMED, index)} style={styles.box}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.VARIANT_THEMED]} count={commits} />
    </View>
  );
}

const VariantThemedBox = memo(VariantThemedBoxComponent);

export { VariantThemedBox };
