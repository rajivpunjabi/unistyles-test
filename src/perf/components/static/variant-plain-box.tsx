/**
 * Variant selection with NO theme access: color variants use fixed hex values.
 * Isolates variant-resolution cost with no theme involvement.
 */

import React, { memo, useRef } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { CATEGORY, CATEGORY_SHORT, boxTestId } from '../../constants';
import { useRenderTracker } from '../../hooks';
import { useVariantStore } from '../../stores';
import { BoxContent } from '../box-content';

const stylesheet = createStyleSheet({
  box: {
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#555555',
    variants: {
      color: {
        primary: { backgroundColor: '#3b6cff' },
        muted: { backgroundColor: '#888888' },
      },
      size: {
        small: { width: 56, height: 44 },
        large: { width: 64, height: 52 },
      },
    },
  },
});

type VariantPlainBoxProps = {
  index: number;
};

function VariantPlainBoxComponent({ index }: VariantPlainBoxProps) {
  const colorVariant = useVariantStore((s) => s.colorVariant);
  const { styles } = useStyles(stylesheet, {
    color: colorVariant,
    size: index % 2 === 0 ? 'small' : 'large',
  });
  const renders = useRef(0);
  renders.current += 1;
  useRenderTracker(CATEGORY.VARIANT_PLAIN, renders.current === 1);

  return (
    <View testID={boxTestId(CATEGORY.VARIANT_PLAIN, index)} style={styles.box}>
      <BoxContent label={CATEGORY_SHORT[CATEGORY.VARIANT_PLAIN]} count={renders.current} />
    </View>
  );
}

const VariantPlainBox = memo(VariantPlainBoxComponent);

export { VariantPlainBox };
