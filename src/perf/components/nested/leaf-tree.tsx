/**
 * Variant "leaf · no-memo": only the leaves consume the theme, the chain is plain
 * (non-consumers), nothing is memoized. Theme toggle -> each themed leaf re-renders
 * via its own subscription; the plain chain is never scheduled and there is nothing
 * below the leaves to cascade to, so the chain stays put (leaf only). memo would do
 * nothing here — there is no re-rendering ancestor to shield the leaves from.
 */

import React from 'react';
import { View } from 'react-native';

import { NEST_PART } from '../../constants';
import type { NestVariantKey } from '../../types';
import { useNestedCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';
import { CHILD_INDICES, LAST_LEVEL, leafThemedSheet, plainStyles } from './nested-styles';

const KEY: NestVariantKey = 'leaf-no-memo';

function LeafLeaf({ level }: { level: number }) {
  const commits = useNestedCommitTracker(KEY, NEST_PART.LEAF);

  return (
    <View style={leafThemedSheet.leaf}>
      <BoxContent label={`L${level}`} count={commits} />
    </View>
  );
}

function LeafChain({ level }: { level: number }) {
  const commits = useNestedCommitTracker(KEY, NEST_PART.CHAIN);

  const childLevel = level + 1;
  const childIsLeaf = childLevel >= LAST_LEVEL;

  return (
    <View style={plainStyles.plainChain}>
      <BoxContent label={`C${level}`} count={commits} />
      <View style={plainStyles.childrenRow}>
        {CHILD_INDICES.map((c) =>
          childIsLeaf ? (
            <LeafLeaf key={c} level={childLevel} />
          ) : (
            <LeafChain key={c} level={childLevel} />
          ),
        )}
      </View>
    </View>
  );
}

function LeafTree() {
  return <LeafChain level={0} />;
}

export { LeafTree };
