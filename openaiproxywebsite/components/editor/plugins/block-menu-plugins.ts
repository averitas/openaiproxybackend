'use client';

import { blockSelectionPlugins } from './block-selection-plugins';

export const blockMenuPlugins = [
  ...blockSelectionPlugins,
] as const;
