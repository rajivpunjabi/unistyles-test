/**
 * Section label above a tree. Its own useStyles consumer, rendered as a SIBLING
 * of the tree (never wrapping it) so its theme re-render does not cascade into
 * the tree.
 */

import React from 'react';
import { Text } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

type TreeHeaderProps = {
  label: string;
};

function TreeHeader({ label }: TreeHeaderProps) {
  const { styles } = useStyles(stylesheet);

  return <Text style={styles.header}>{label}</Text>;
}

const stylesheet = createStyleSheet({
  header: {
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 4,
    marginHorizontal: 8,
    borderRadius: 4,
  },
});

export { TreeHeader };
