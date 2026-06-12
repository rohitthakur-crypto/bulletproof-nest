import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Workspace, WorkspaceMember } from '@prisma/client';

import { WorkspaceMemberCacheService } from '../cache/workspace-member.cache';
import { WorkspaceMemberRepository } from '../repositories';
import type { CreateWorkspaceMemberInput, UpdateWorkspaceMemberInput } from '../validators';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly workspaceMemberCache: WorkspaceMemberCacheService,
  ) {}

  public async requireMembership(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    const member = await this.findByWorkspaceAndUser(workspaceId, userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return member;
  }

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

  findManyByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.workspaceMemberRepository.findManyByWorkspace(workspaceId);
  }

  async findWorkspacesForUser(userId: string): Promise<Workspace[]> {
    const memberships = await this.workspaceMemberRepository.findManyByUserWithWorkspaces(userId);
    return memberships.map((membership) => membership.workspace);
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
