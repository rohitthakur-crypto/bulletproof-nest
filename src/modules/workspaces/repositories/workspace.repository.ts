import { Injectable } from '@nestjs/common';
import type { Prisma, Workspace } from '@prisma/client';

import { BasePrismaRepository, PrismaService } from '@/infra/prisma';

@Injectable()
export class WorkspaceRepository extends BasePrismaRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<Workspace | null> {
    return this.db.workspace.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<Workspace | null> {
    return this.db.workspace.findUnique({ where: { slug } });
  }

  create(data: Prisma.WorkspaceCreateInput): Promise<Workspace> {
    return this.db.workspace.create({ data });
  }

  update(id: string, data: Prisma.WorkspaceUpdateInput): Promise<Workspace> {
    return this.db.workspace.update({ where: { id }, data });
  }

  delete(id: string): Promise<Workspace> {
    return this.db.workspace.delete({ where: { id } });
  }
}
