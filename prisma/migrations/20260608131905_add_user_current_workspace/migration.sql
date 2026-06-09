/*
  Warnings:

  - You are about to drop the column `plan` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentWorkspaceId" UUID;

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "plan",
DROP COLUMN "timezone";

-- CreateIndex
CREATE INDEX "User_currentWorkspaceId_idx" ON "User"("currentWorkspaceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentWorkspaceId_fkey" FOREIGN KEY ("currentWorkspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
