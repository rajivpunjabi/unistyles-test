/**
 * Shared styles + shape constants for the nested binary trees. Each variant tree
 * (all/parent/leaf) is its own component.
 *
 * Themed node/leaf are unistyles StyleSheet.create (theme consumers; in v3 they
 * update via the ShadowTree with no re-render). Plain node/leaf + the children row
 * are react-native StyleSheet — NOT unistyles — on purpose: the plain nodes must
 * stay non-consumers so a theme toggle never touches them (that is what the
 * leaf-no-memo variant shows).
 */

import { StyleSheet as RNStyleSheet } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { NEST_BRANCHING, NEST_DEPTH } from '../../constants';

const CHILD_INDICES = Array.from({ length: NEST_BRANCHING }, (_, i) => i);

const LAST_LEVEL = NEST_DEPTH - 1;

const plainStyles = RNStyleSheet.create({
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

const chainThemedSheet = StyleSheet.create((theme) => ({
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

const leafThemedSheet = StyleSheet.create((theme) => ({
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

export { CHILD_INDICES, LAST_LEVEL, plainStyles, chainThemedSheet, leafThemedSheet };
