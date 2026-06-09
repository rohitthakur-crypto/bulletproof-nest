import { nanoid } from 'nanoid';

import { generateBaseSlug } from '@/common/utils';

export function createWorkspaceSlug(name: string): string {
  const baseSlug = generateBaseSlug(name);

  const suffix = nanoid(4).toLowerCase();

  return `${baseSlug}-${suffix}`;
}
