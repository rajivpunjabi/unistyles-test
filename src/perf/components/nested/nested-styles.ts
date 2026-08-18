/**
 * Shared styles + shape constants for the nested binary trees. Each variant tree
 * (all/parent/leaf) is its own component; these are the common node styles they
 * draw from — themed sheets for theme consumers, plain inline styles for non-
 * consumers.
 */

import type { ViewStyle } from 'react-native';
import { createStyleSheet } from 'react-native-unistyles';

import { NEST_BRANCHING, NEST_DEPTH } from '../../constants';

const CHILD_INDICES = Array.from({ length: NEST_BRANCHING }, (_, i) => i);

const LAST_LEVEL = NEST_DEPTH - 1;

const PLAIN_CHAIN_STYLE = {
  padding: 3,
  margin: 1,
  borderWidth: 1,
  borderColor: '#88888855',
  borderRadius: 4,
  alignItems: 'center',
  gap: 3,
} satisfies ViewStyle;

const PLAIN_LEAF_STYLE = {
  width: 40,
  height: 30,
  margin: 1,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#88888855',
  backgroundColor: '#888888',
  alignItems: 'center',
  justifyContent: 'center',
} satisfies ViewStyle;

const CHILDREN_ROW_STYLE = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'center',
} satisfies ViewStyle;

const chainThemedSheet = createStyleSheet((theme) => ({
  node: {
    padding: 3,
    margin: 1,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    gap: 3,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.element,
  },
}));

const leafThemedSheet = createStyleSheet((theme) => ({
  leaf: {
    width: 40,
    height: 30,
    margin: 1,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.element,
  },
}));

export {
  CHILD_INDICES,
  LAST_LEVEL,
  PLAIN_CHAIN_STYLE,
  PLAIN_LEAF_STYLE,
  CHILDREN_ROW_STYLE,
  chainThemedSheet,
  leafThemedSheet,
};
