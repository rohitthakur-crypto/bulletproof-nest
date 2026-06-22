-- CreateTable
CREATE TABLE "SocialPost" (
    "id" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,
    "platformPostId" TEXT NOT NULL,
    "caption" TEXT,
    "mediaType" TEXT,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "permalink" TEXT,
    "publishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialPost_socialAccountId_publishedAt_idx" ON "SocialPost"("socialAccountId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_socialAccountId_platformPostId_key" ON "SocialPost"("socialAccountId", "platformPostId");

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
