/*
  Warnings:

  - The values [TELEGRAM,TIKTOK,WEBCHAT] on the enum `SocialPlatform` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `workspaceId` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `deliveredAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `connectedAt` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `connectedById` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `externalAccountId` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `externalUserId` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `lastSyncedAt` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `metaPageId` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `metaPageName` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `syncError` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `syncStatus` on the `SocialAccount` table. All the data in the column will be lost.
  - You are about to drop the column `encrypted` on the `SocialCredential` table. All the data in the column will be lost.
  - You are about to drop the column `invalidAt` on the `SocialCredential` table. All the data in the column will be lost.
  - You are about to drop the column `lastRefreshedAt` on the `SocialCredential` table. All the data in the column will be lost.
  - You are about to drop the column `providerUserId` on the `SocialCredential` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `SocialCredential` table. All the data in the column will be lost.
  - You are about to drop the column `scopes` on the `SocialCredential` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `SocialCredential` table. All the data in the column will be lost.
  - You are about to drop the column `processed` on the `WebhookEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[workspaceId,platform,platformAccountId]` on the table `SocialAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[socialAccountId,externalEventId]` on the table `WebhookEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platformAccountId` to the `SocialAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialConnectionId` to the `SocialAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialAccountId` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.
  - Made the column `workspaceId` on table `WebhookEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('META');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AutomationTriggerType" ADD VALUE 'COMMENT_CREATED';
ALTER TYPE "AutomationTriggerType" ADD VALUE 'MESSAGE_RECEIVED';
ALTER TYPE "AutomationTriggerType" ADD VALUE 'MENTION_CREATED';

-- AlterEnum
BEGIN;
CREATE TYPE "SocialPlatform_new" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'WHATSAPP');
ALTER TABLE "SocialAccount" ALTER COLUMN "platform" TYPE "SocialPlatform_new" USING ("platform"::text::"SocialPlatform_new");
ALTER TABLE "WebhookEvent" ALTER COLUMN "platform" TYPE "SocialPlatform_new" USING ("platform"::text::"SocialPlatform_new");
ALTER TYPE "SocialPlatform" RENAME TO "SocialPlatform_old";
ALTER TYPE "SocialPlatform_new" RENAME TO "SocialPlatform";
DROP TYPE "public"."SocialPlatform_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_workspaceId_fkey";

-- DropIndex
DROP INDEX "Automation_socialAccountId_idx";

-- DropIndex
DROP INDEX "Automation_status_idx";

-- DropIndex
DROP INDEX "Automation_workspaceId_idx";

-- DropIndex
DROP INDEX "AutomationExecution_workspaceId_idx";

-- DropIndex
DROP INDEX "Contact_externalContactId_idx";

-- DropIndex
DROP INDEX "Contact_socialAccountId_idx";

-- DropIndex
DROP INDEX "Contact_workspaceId_idx";

-- DropIndex
DROP INDEX "Conversation_contactId_idx";

-- DropIndex
DROP INDEX "Conversation_socialAccountId_idx";

-- DropIndex
DROP INDEX "Conversation_workspaceId_idx";

-- DropIndex
DROP INDEX "Message_contactId_idx";

-- DropIndex
DROP INDEX "Message_conversationId_idx";

-- DropIndex
DROP INDEX "Message_workspaceId_idx";

-- DropIndex
DROP INDEX "SocialAccount_externalAccountId_idx";

-- DropIndex
DROP INDEX "SocialAccount_platform_externalAccountId_key";

-- DropIndex
DROP INDEX "SocialAccount_platform_idx";

-- DropIndex
DROP INDEX "SocialCredential_providerUserId_idx";

-- DropIndex
DROP INDEX "WebhookEvent_platform_idx";

-- DropIndex
DROP INDEX "WebhookEvent_processed_idx";

-- DropIndex
DROP INDEX "WebhookEvent_workspaceId_idx";

-- DropIndex
DROP INDEX "WorkspaceMember_userId_idx";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "workspaceId";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "workspaceId";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "deliveredAt",
DROP COLUMN "readAt",
DROP COLUMN "workspaceId";

-- AlterTable
ALTER TABLE "SocialAccount" DROP COLUMN "connectedAt",
DROP COLUMN "connectedById",
DROP COLUMN "externalAccountId",
DROP COLUMN "externalUserId",
DROP COLUMN "lastSyncedAt",
DROP COLUMN "metaPageId",
DROP COLUMN "metaPageName",
DROP COLUMN "syncError",
DROP COLUMN "syncStatus",
ADD COLUMN     "platformAccountId" TEXT NOT NULL,
ADD COLUMN     "socialConnectionId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "SocialCredential" DROP COLUMN "encrypted",
DROP COLUMN "invalidAt",
DROP COLUMN "lastRefreshedAt",
DROP COLUMN "providerUserId",
DROP COLUMN "refreshToken",
DROP COLUMN "scopes",
DROP COLUMN "tokenType";

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "processed",
ADD COLUMN     "socialAccountId" UUID NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "workspaceId" SET NOT NULL;

-- CreateTable
CREATE TABLE "SocialConnection" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "providerUserId" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialConnection_workspaceId_idx" ON "SocialConnection"("workspaceId");

-- CreateIndex
CREATE INDEX "Automation_socialAccountId_status_idx" ON "Automation"("socialAccountId", "status");

-- CreateIndex
CREATE INDEX "Contact_socialAccountId_externalContactId_idx" ON "Contact"("socialAccountId", "externalContactId");

-- CreateIndex
CREATE INDEX "Conversation_socialAccountId_contactId_idx" ON "Conversation"("socialAccountId", "contactId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "SocialAccount_socialConnectionId_idx" ON "SocialAccount"("socialConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_workspaceId_platform_platformAccountId_key" ON "SocialAccount"("workspaceId", "platform", "platformAccountId");

-- CreateIndex
CREATE INDEX "SocialCredential_socialAccountId_idx" ON "SocialCredential"("socialAccountId");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_socialAccountId_externalEventId_key" ON "WebhookEvent"("socialAccountId", "externalEventId");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_socialConnectionId_fkey" FOREIGN KEY ("socialConnectionId") REFERENCES "SocialConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
