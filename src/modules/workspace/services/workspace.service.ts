import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, Workspace } from '@prisma/client';

import { WorkspaceCacheService } from '../cache/workspace.cache';
import { WorkspaceRepository } from '../repositories/workspace.repository';
import { createWorkspaceSlug } from '../utils/create-workspace-slug.util';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../validators';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceCache: WorkspaceCacheService,
  ) {}

  findById(id: string): Promise<Workspace> {
    return this.workspaceCache.rememberById(id, async () => {
      const workspace = await this.workspaceRepository.findById(id);
      if (!workspace) throw new NotFoundException('Workspace not found');
      return workspace;
    });
  }

  findBySlug(slug: string): Promise<Workspace | null> {
    return this.workspaceCache.getOrSetBySlug(slug, () =>
      this.workspaceRepository.findBySlug(slug),
    );
  }

  async create(data: CreateWorkspaceInput): Promise<Workspace> {
    const { name, logo } = data;

    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = createWorkspaceSlug(name);

      try {
        return await this.workspaceRepository.create({ name: name, slug: slug, logo: logo });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerErrorException('Failed to generate unique workspace slug');
  }

  async update(id: string, data: UpdateWorkspaceInput): Promise<Workspace> {
    const existing = await this.findById(id);
    const updated = await this.workspaceRepository.update(id, data);

    await this.workspaceCache.invalidateWorkspace(id, existing.slug);

    if (updated.slug !== existing.slug) {
      await this.workspaceCache.invalidateWorkspace(id, updated.slug);
    }

    return updated;
  }

  async delete(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.delete(id);
    await this.workspaceCache.invalidateWorkspace(workspace.id, workspace.slug);
    return workspace;
  }
}
