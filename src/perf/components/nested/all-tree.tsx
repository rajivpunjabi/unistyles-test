/**
 * Variant "all · no-memo": every node consumes the theme, nothing is memoized.
 * Theme toggle -> the themed root re-renders and, with no memo, cascades down so
 * every chain + leaf node re-renders. Bump -> same (full cascade).
 */

import React from 'react';
import { View } from 'react-native';
import { useStyles } from 'react-native-unistyles';

import { NEST_PART } from '../../constants';
import type { NestVariantKey } from '../../types';
import { useNestedCommitTracker } from '../../hooks';
import { BoxContent } from '../box-content';
import {
  CHILD_INDICES,
  LAST_LEVEL,
  chainThemedSheet,
  leafThemedSheet,
  plainStyles,
} from './nested-styles';

const KEY: NestVariantKey = 'all-no-memo';

function AllLeaf({ level }: { level: number }) {
  const { styles } = useStyles(leafThemedSheet);
  const commits = useNestedCommitTracker(KEY, NEST_PART.LEAF);

  return (
    <View style={styles.leaf}>
      <BoxContent label={`L${level}`} count={commits} />
    </View>
  );
}

function AllChain({ level }: { level: number }) {
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
            <AllLeaf key={c} level={childLevel} />
          ) : (
            <AllChain key={c} level={childLevel} />
          ),
        )}
      </View>
    </View>
  );
}

function AllTree() {
  return <AllChain level={0} />;
}

export { AllTree };
