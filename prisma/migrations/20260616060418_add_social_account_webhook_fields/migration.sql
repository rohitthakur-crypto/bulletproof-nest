-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "webhookFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "webhookSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "webhookSubscribedAt" TIMESTAMP(3);
