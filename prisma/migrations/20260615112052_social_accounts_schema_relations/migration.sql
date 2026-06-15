/*
  Warnings:

  - You are about to drop the column `socialConnectionId` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the `SocialConnection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialAccount" DROP CONSTRAINT "SocialAccount_socialConnectionId_fkey";

-- DropForeignKey
ALTER TABLE "SocialConnection" DROP CONSTRAINT "SocialConnection_workspaceId_fkey";

-- DropIndex
DROP INDEX "SocialAccount_socialConnectionId_idx";

-- AlterTable
ALTER TABLE "SocialAccount" DROP COLUMN "socialConnectionId",
ADD COLUMN     "metaPageId" TEXT;

-- DropTable
DROP TABLE "SocialConnection";
