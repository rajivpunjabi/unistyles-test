/**
 * Variant "all · no-memo": every node consumes the theme, nothing is memoized.
 * Theme toggle -> the themed root re-renders and, with no memo, cascades down so
 * every chain + leaf node re-renders. Bump -> same (full cascade).
 */

import React from 'react';
import { View } from 'react-native';
import { useStyles } from 'react-native-unistyles';

import { NEST_BRANCHING, NEST_PART } from '../../constants';
import type { NestVariantKey } from '../../types';
import { useNestedRenderTracker } from '../../use-nested-render-tracker';
import { BoxContent } from '../box-content';
import {
  CHILD_INDICES,
  CHILDREN_ROW_STYLE,
  LAST_LEVEL,
  chainThemedSheet,
  leafThemedSheet,
} from './nested-styles';

const KEY: NestVariantKey = 'all-no-memo';

function AllLeaf({ index }: { index: number }) {
  const { styles } = useStyles(leafThemedSheet);
  const renders = React.useRef(0);
  renders.current += 1;
  useNestedRenderTracker(KEY, NEST_PART.LEAF, renders.current === 1);

  return (
    <View style={styles.leaf}>
      <BoxContent label={`L${index}`} count={renders.current} />
    </View>
  );
}

function AllChain({ level, index }: { level: number; index: number }) {
  const { styles } = useStyles(chainThemedSheet);
  const renders = React.useRef(0);
  renders.current += 1;
  useNestedRenderTracker(KEY, NEST_PART.CHAIN, renders.current === 1);

  const childLevel = level + 1;
  const childIsLeaf = childLevel >= LAST_LEVEL;

  return (
    <View style={styles.node}>
      <BoxContent label={`C${level}`} count={renders.current} />
      <View style={CHILDREN_ROW_STYLE}>
        {CHILD_INDICES.map((c) => {
          const childIndex = index * NEST_BRANCHING + c;
          return childIsLeaf ? (
            <AllLeaf key={c} index={childIndex} />
          ) : (
            <AllChain key={c} level={childLevel} index={childIndex} />
          );
        })}
      </View>
    </View>
  );
}

function AllTree() {
  return <AllChain level={0} index={0} />;
}

export { AllTree };
