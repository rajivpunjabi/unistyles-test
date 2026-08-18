/**
 * Recursive non-memoized tree: a linear chain of NEST_DEPTH-1 plain wrapper Views
 * (A -> B -> C -> D ...) that branches only at the last level into NEST_BRANCHING
 * leaf siblings (E, F, G). Intermediate chain nodes are plain inline-styled Views
 * (NOT unistyles consumers); only the leaves consume styles via useStyles, so:
 * - a top-level re-render cascades down the whole chain to the leaves (nothing is
 *   memoized), and
 * - a theme switch re-renders only the leaves (the sole subscribers), leaving the
 *   chain nodes untouched.
 */

import React, { useRef } from 'react';
import { View, type ViewStyle } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { NEST_BRANCHING, NEST_DEPTH, leafTestId } from '../constants';
import { useNestedRenderTracker } from '../use-nested-render-tracker';
import { BoxContent } from './box-content';

const BRANCH_STYLE = {
  padding: 3,
  margin: 1,
  borderWidth: 1,
  borderColor: '#88888855',
  borderRadius: 4,
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
} satisfies ViewStyle;

const LEAF_ROW_STYLE = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
} satisfies ViewStyle;

const leafStylesheet = createStyleSheet((theme) => ({
  leaf: {
    width: 44,
    height: 34,
    margin: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.element,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

type LeafProps = {
  tree: number;
  index: number;
};

function Leaf({ tree, index }: LeafProps) {
  const { styles } = useStyles(leafStylesheet);
  const renders = useRef(0);
  renders.current += 1;
  const id = leafTestId(tree, index);
  useNestedRenderTracker(tree, id, styles.leaf);

  return (
    <View testID={id} style={styles.leaf}>
      <BoxContent label={`T${tree}`} count={renders.current} />
    </View>
  );
}

type NestedTreeProps = {
  tree: number;
  level?: number;
};

function NestedTree({ tree, level = 0 }: NestedTreeProps) {
  const renders = useRef(0);
  renders.current += 1;
  const isLastLevel = level >= NEST_DEPTH - 1;

  let inner: React.ReactNode;
  if (isLastLevel) {
    const leaves = [];
    for (let c = 0; c < NEST_BRANCHING; c++) {
      leaves.push(<Leaf key={c} tree={tree} index={c} />);
    }
    inner = <View style={LEAF_ROW_STYLE}>{leaves}</View>;
  } else {
    inner = <NestedTree tree={tree} level={level + 1} />;
  }

  return (
    <View style={BRANCH_STYLE}>
      <BoxContent label={`T${tree}·L${level}`} count={renders.current} />
      {inner}
    </View>
  );
}

export { NestedTree };
