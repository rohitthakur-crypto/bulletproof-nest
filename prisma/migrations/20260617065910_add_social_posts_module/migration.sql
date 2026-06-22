/*
  Warnings:

  - Added the required column `platform` to the `SocialPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `SocialPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SocialPost" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "platform" "SocialPlatform" NOT NULL,
ADD COLUMN     "workspaceId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "SocialPostSyncState" (
    "id" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,
    "nextCursor" TEXT,
    "hasMore" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPostSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialPostSyncState_socialAccountId_key" ON "SocialPostSyncState"("socialAccountId");

-- CreateIndex
CREATE INDEX "SocialPost_workspaceId_idx" ON "SocialPost"("workspaceId");

-- CreateIndex
CREATE INDEX "SocialPost_isDeleted_idx" ON "SocialPost"("isDeleted");

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostSyncState" ADD CONSTRAINT "SocialPostSyncState_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
