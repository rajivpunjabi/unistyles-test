import type { ComponentType } from 'react';

import type { NestVariantKey } from '../../types';
import { AllTree } from './all-tree';
import { LeafTree } from './leaf-tree';
import { ParentTree } from './parent-tree';

const NESTED_TREE_BY_KEY: Record<NestVariantKey, ComponentType> = {
  'all-no-memo': AllTree,
  'parent-memo': ParentTree,
  'leaf-no-memo': LeafTree,
};

export { AllTree, ParentTree, LeafTree, NESTED_TREE_BY_KEY };
export { NestedControls } from './nested-controls';
export { TreeHeader } from './tree-header';
