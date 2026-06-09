import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { WorkspaceMember } from '@prisma/client';

import { WorkspaceMemberCacheService } from '../cache/workspace-member.cache';
import { WorkspaceMemberRepository } from '../repositories/workspace-member.repository';
import type { CreateWorkspaceMemberInput, UpdateWorkspaceMemberInput } from '../validators';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly workspaceMemberCache: WorkspaceMemberCacheService,
  ) {}

  findById(id: string): Promise<WorkspaceMember> {
    return this.workspaceMemberCache.rememberById(id, async () => {
      const member = await this.workspaceMemberRepository.findById(id);
      if (!member) throw new NotFoundException('Workspace member not found');
      return member;
    });
  }

  findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    return this.workspaceMemberCache.getOrSetByWorkspaceAndUser(workspaceId, userId, () =>
      this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId),
    );
  }

  async findLatestWorkspaceForUser(userId: string): Promise<WorkspaceMember | null> {
    return this.workspaceMemberRepository.findLatestByUser(userId);
  }

  findManyByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.workspaceMemberRepository.findManyByWorkspace(workspaceId);
  }

  async create(workspaceId: string, data: CreateWorkspaceMemberInput): Promise<WorkspaceMember> {
    const existing = await this.findByWorkspaceAndUser(workspaceId, data.userId);
    if (existing) throw new ConflictException('User is already a member of this workspace');

    return this.workspaceMemberRepository.create({
      workspace: { connect: { id: workspaceId } },
      user: { connect: { id: data.userId } },
      role: data.role,
    });
  }

  async update(id: string, data: UpdateWorkspaceMemberInput): Promise<WorkspaceMember> {
    const existing = await this.findById(id);
    const updated = await this.workspaceMemberRepository.update(id, data);

    await this.workspaceMemberCache.invalidateMember(
      existing.id,
      existing.workspaceId,
      existing.userId,
    );

    return updated;
  }

  async delete(id: string): Promise<WorkspaceMember> {
    const member = await this.workspaceMemberRepository.delete(id);

    await this.workspaceMemberCache.invalidateMember(member.id, member.workspaceId, member.userId);

    return member;
  }
}
