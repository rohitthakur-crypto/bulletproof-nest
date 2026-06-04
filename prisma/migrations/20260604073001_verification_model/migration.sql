/*
  Warnings:

  - The values [WEB] on the enum `DeviceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `passwordHash` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserPasswordResetToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET');

-- AlterEnum
BEGIN;
CREATE TYPE "DeviceType_new" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET');
ALTER TABLE "UserSession" ALTER COLUMN "deviceType" TYPE "DeviceType_new" USING ("deviceType"::text::"DeviceType_new");
ALTER TABLE "AdminSession" ALTER COLUMN "deviceType" TYPE "DeviceType_new" USING ("deviceType"::text::"DeviceType_new");
ALTER TYPE "DeviceType" RENAME TO "DeviceType_old";
ALTER TYPE "DeviceType_new" RENAME TO "DeviceType";
DROP TYPE "public"."DeviceType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "UserPasswordResetToken" DROP CONSTRAINT "UserPasswordResetToken_userId_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "passwordHash";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastLoginAt",
DROP COLUMN "passwordHash",
ADD COLUMN     "lastActiveAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "UserPasswordResetToken";

-- CreateTable
CREATE TABLE "UserCredential" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVerificationToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "VerificationTokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminCredential" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCredential_userId_key" ON "UserCredential"("userId");

-- CreateIndex
CREATE INDEX "UserVerificationToken_userId_idx" ON "UserVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "UserVerificationToken_type_idx" ON "UserVerificationToken"("type");

-- CreateIndex
CREATE INDEX "UserVerificationToken_expiresAt_idx" ON "UserVerificationToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminCredential_adminId_key" ON "AdminCredential"("adminId");

-- AddForeignKey
ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVerificationToken" ADD CONSTRAINT "UserVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCredential" ADD CONSTRAINT "AdminCredential_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
