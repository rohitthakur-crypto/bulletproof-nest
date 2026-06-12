import { Injectable } from '@nestjs/common';
import type { Prisma, WorkspaceMember } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class WorkspaceMemberRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<WorkspaceMember | null> {
    return this.db.workspaceMember.findUnique({ where: { id } });
  }

  findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    return this.db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  findManyByWorkspace(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.db.workspaceMember.findMany({ where: { workspaceId } });
  }

  findManyByUserWithWorkspaces(userId: string) {
    return this.db.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Prisma.WorkspaceMemberCreateInput): Promise<WorkspaceMember> {
    return this.db.workspaceMember.create({ data });
  }

  update(id: string, data: Prisma.WorkspaceMemberUpdateInput): Promise<WorkspaceMember> {
    return this.db.workspaceMember.update({ where: { id }, data });
  }

  delete(id: string): Promise<WorkspaceMember> {
    return this.db.workspaceMember.delete({ where: { id } });
  }
}
