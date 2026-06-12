/*
  Warnings:

  - You are about to drop the column `accessToken` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExpiresAt` on the `SocialAccount` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SocialAccountSyncStatus" AS ENUM ('PENDING', 'SYNCING', 'ACTIVE', 'FAILED', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "SocialAccount" DROP COLUMN "accessToken",
DROP COLUMN "refreshToken",
DROP COLUMN "tokenExpiresAt",
ADD COLUMN     "connectedById" UUID,
ADD COLUMN     "externalUserId" TEXT,
ADD COLUMN     "metaPageName" TEXT,
ADD COLUMN     "syncError" TEXT,
ADD COLUMN     "syncStatus" "SocialAccountSyncStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "SocialCredential" (
    "id" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenType" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "providerUserId" TEXT,
    "lastRefreshedAt" TIMESTAMP(3),
    "invalidAt" TIMESTAMP(3),
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialCredential_socialAccountId_key" ON "SocialCredential"("socialAccountId");

-- CreateIndex
CREATE INDEX "SocialCredential_expiresAt_idx" ON "SocialCredential"("expiresAt");

-- CreateIndex
CREATE INDEX "SocialCredential_providerUserId_idx" ON "SocialCredential"("providerUserId");

-- AddForeignKey
ALTER TABLE "SocialCredential" ADD CONSTRAINT "SocialCredential_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
