import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, Workspace, WorkspaceMemberRole } from '@prisma/client';

import { WorkspaceCacheService } from '../cache/workspace.cache';
import type { WorkspaceResponse } from '../dto';
import { toWorkspaceResponse } from '../mappers/workspace-response.mapper';
import { WorkspaceRepository } from '../repositories/workspace.repository';
import { createWorkspaceSlug } from '../utils/create-workspace-slug.util';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../validators';

import { WorkspaceMemberService } from './workspace-member.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly workspaceCache: WorkspaceCacheService,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  async listForUser(userId: string): Promise<WorkspaceResponse[]> {
    const workspaces = await this.workspaceMemberService.findWorkspacesForUser(userId);
    return workspaces.map(toWorkspaceResponse);
  }

  public async createForUser(
    userId: string,
    data: CreateWorkspaceInput,
  ): Promise<WorkspaceResponse> {
    const workspace = await this.create(data);

    await this.workspaceMemberService.create(workspace.id, {
      userId,
      role: WorkspaceMemberRole.OWNER,
    });

    return toWorkspaceResponse(workspace);
  }

  async getById(id: string): Promise<WorkspaceResponse> {
    const workspace = await this.findById(id);
    return toWorkspaceResponse(workspace);
  }

  findById(id: string): Promise<Workspace> {
    return this.workspaceCache.getOrSetById(id, async () => {
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

  private async create(data: CreateWorkspaceInput): Promise<Workspace> {
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

  async update(id: string, data: UpdateWorkspaceInput): Promise<WorkspaceResponse> {
    const existing = await this.findById(id);
    const updated = await this.workspaceRepository.update(id, data);

    await this.workspaceCache.invalidateWorkspace(id, existing.slug);

    if (updated.slug !== existing.slug) {
      await this.workspaceCache.invalidateWorkspace(id, updated.slug);
    }

    return toWorkspaceResponse(updated);
  }

  async remove(id: string): Promise<WorkspaceResponse> {
    const existing = await this.findById(id);
    const deleted = await this.workspaceRepository.delete(id);

    await this.workspaceCache.invalidateWorkspace(existing.id, existing.slug);

    return toWorkspaceResponse(deleted);
  }
}
