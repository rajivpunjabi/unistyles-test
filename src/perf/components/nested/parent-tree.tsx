/**
 * Variant "parent · memo": the chain consumes the theme, the leaves are plain
 * (non-consumers), and every node is memoized. Theme toggle -> the themed chain
 * re-renders, but the memo boundary above the plain leaves stops the cascade, so
 * leaves are spared (chain only). This is the one arrangement where memo buys
 * isolation. Bump -> memo skips everything (0/0).
 */

import React, { memo } from 'react';
import { View } from 'react-native';
import { useStyles } from 'react-native-unistyles';

import { NEST_BRANCHING, NEST_PART } from '../../constants';
import type { NestVariantKey } from '../../types';
import { useNestedRenderTracker } from '../../use-nested-render-tracker';
import { BoxContent } from '../box-content';
import { CHILD_INDICES, LAST_LEVEL, chainThemedSheet, plainStyles } from './nested-styles';

const KEY: NestVariantKey = 'parent-memo';

const ParentLeaf = memo(function ParentLeaf({ index }: { index: number }) {
  const renders = React.useRef(0);
  renders.current += 1;
  useNestedRenderTracker(KEY, NEST_PART.LEAF, renders.current === 1);

  return (
    <View style={plainStyles.plainLeaf}>
      <BoxContent label={`L${index}`} count={renders.current} />
    </View>
  );
});

const ParentChain = memo(function ParentChain({ level, index }: { level: number; index: number }) {
  const { styles } = useStyles(chainThemedSheet);
  const renders = React.useRef(0);
  renders.current += 1;
  useNestedRenderTracker(KEY, NEST_PART.CHAIN, renders.current === 1);

  const childLevel = level + 1;
  const childIsLeaf = childLevel >= LAST_LEVEL;

  return (
    <View style={styles.node}>
      <BoxContent label={`C${level}`} count={renders.current} />
      <View style={plainStyles.childrenRow}>
        {CHILD_INDICES.map((c) => {
          const childIndex = index * NEST_BRANCHING + c;
          return childIsLeaf ? (
            <ParentLeaf key={c} index={childIndex} />
          ) : (
            <ParentChain key={c} level={childLevel} index={childIndex} />
          );
        })}
      </View>
    </View>
  );
});

function ParentTree() {
  return <ParentChain level={0} index={0} />;
}

export { ParentTree };
