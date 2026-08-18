/**
 * Variant "leaf · no-memo": only the leaves consume the theme, the chain is plain
 * (non-consumers), nothing is memoized. Theme toggle -> each themed leaf re-renders
 * via its own subscription; the plain chain is never scheduled and there is nothing
 * below the leaves to cascade to, so the chain stays put (leaf only). memo would do
 * nothing here — there is no re-rendering ancestor to shield the leaves from.
 */

import React from 'react';
import { View } from 'react-native';
import { useStyles } from 'react-native-unistyles';

import { NEST_BRANCHING, NEST_PART, nestTestId } from '../../constants';
import type { NestVariantKey } from '../../types';
import { useNestedRenderTracker } from '../../use-nested-render-tracker';
import { BoxContent } from '../box-content';
import {
  CHILD_INDICES,
  CHILDREN_ROW_STYLE,
  LAST_LEVEL,
  PLAIN_CHAIN_STYLE,
  leafThemedSheet,
} from './nested-styles';

const KEY: NestVariantKey = 'leaf-no-memo';

function LeafLeaf({ index }: { index: number }) {
  const { styles } = useStyles(leafThemedSheet);
  const renders = React.useRef(0);
  renders.current += 1;
  useNestedRenderTracker(KEY, NEST_PART.LEAF, nestTestId(KEY, NEST_PART.LEAF, index), styles.leaf);

  return (
    <View style={styles.leaf}>
      <BoxContent label={`L${index}`} count={renders.current} />
    </View>
  );
}

function LeafChain({ level, index }: { level: number; index: number }) {
  const renders = React.useRef(0);
  renders.current += 1;
  useNestedRenderTracker(
    KEY,
    NEST_PART.CHAIN,
    nestTestId(KEY, NEST_PART.CHAIN, level * 100 + index),
    PLAIN_CHAIN_STYLE,
  );

  const childLevel = level + 1;
  const childIsLeaf = childLevel >= LAST_LEVEL;

  return (
    <View style={PLAIN_CHAIN_STYLE}>
      <BoxContent label={`C${level}`} count={renders.current} />
      <View style={CHILDREN_ROW_STYLE}>
        {CHILD_INDICES.map((c) => {
          const childIndex = index * NEST_BRANCHING + c;
          return childIsLeaf ? (
            <LeafLeaf key={c} index={childIndex} />
          ) : (
            <LeafChain key={c} level={childLevel} index={childIndex} />
          );
        })}
      </View>
    </View>
  );
}

function LeafTree() {
  return <LeafChain level={0} index={0} />;
}

export { LeafTree };
