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

import { NEST_PART } from '../../constants';
import type { NestVariantKey } from '../../types';
import { useNestedCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';
import { CHILD_INDICES, LAST_LEVEL, chainThemedSheet, plainStyles } from './nested-styles';

const KEY: NestVariantKey = 'parent-memo';

const ParentLeaf = memo(function ParentLeaf({ level }: { level: number }) {
  const commits = useNestedCommitTracker(KEY, NEST_PART.LEAF);

  return (
    <View style={plainStyles.plainLeaf}>
      <BoxContent label={`L${level}`} count={commits} />
    </View>
  );
});

const ParentChain = memo(function ParentChain({ level }: { level: number }) {
  const { styles } = useStyles(chainThemedSheet);
  const commits = useNestedCommitTracker(KEY, NEST_PART.CHAIN);

  const childLevel = level + 1;
  const childIsLeaf = childLevel >= LAST_LEVEL;

  return (
    <View style={styles.node}>
      <BoxContent label={`C${level}`} count={commits} />
      <View style={plainStyles.childrenRow}>
        {CHILD_INDICES.map((c) =>
          childIsLeaf ? (
            <ParentLeaf key={c} level={childLevel} />
          ) : (
            <ParentChain key={c} level={childLevel} />
          ),
        )}
      </View>
    </View>
  );
});

function ParentTree() {
  return <ParentChain level={0} />;
}

export { ParentTree };
