/*
  Warnings:

  - You are about to drop the column `currentWorkspaceId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_currentWorkspaceId_fkey";

-- DropIndex
DROP INDEX "User_currentWorkspaceId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "currentWorkspaceId";
