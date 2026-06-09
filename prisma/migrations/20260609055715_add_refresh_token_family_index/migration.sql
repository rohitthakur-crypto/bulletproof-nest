-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateIndex
CREATE INDEX "UserRefreshToken_tokenFamily_idx" ON "UserRefreshToken"("tokenFamily");
