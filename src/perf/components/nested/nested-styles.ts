/**
 * Shared styles + shape constants for the nested binary trees. Each variant tree
 * (all/parent/leaf) is its own component. All static react-native StyleSheet;
 * the "themed" node/leaf just use fixed light-theme colors (no theming).
 */

import { StyleSheet } from 'react-native';

import { lightTheme } from '@/styles/themes';
import { NEST_BRANCHING, NEST_DEPTH } from '../../constants';

const CHILD_INDICES = Array.from({ length: NEST_BRANCHING }, (_, i) => i);

const LAST_LEVEL = NEST_DEPTH - 1;

const plainStyles = StyleSheet.create({
  plainChain: {
    padding: 3,
    margin: 1,
    borderWidth: 1,
    borderColor: '#88888855',
    borderRadius: 4,
    alignItems: 'center',
    gap: 3,
  },
  plainLeaf: {
    width: 40,
    height: 30,
    margin: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#88888855',
    backgroundColor: '#888888',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childrenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});

const chainThemedSheet = StyleSheet.create({
  node: {
    padding: 3,
    margin: 1,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    gap: 3,
    borderColor: lightTheme.colors.border,
    backgroundColor: lightTheme.colors.element,
  },
});

const leafThemedSheet = StyleSheet.create({
  leaf: {
    width: 40,
    height: 30,
    margin: 1,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: lightTheme.colors.border,
    backgroundColor: lightTheme.colors.element,
  },
});

export { CHILD_INDICES, LAST_LEVEL, plainStyles, chainThemedSheet, leafThemedSheet };
