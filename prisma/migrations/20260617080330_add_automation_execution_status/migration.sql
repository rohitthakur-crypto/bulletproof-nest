/*
  Warnings:

  - The `status` column on the `AutomationExecution` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AutomationExecutionStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "AutomationExecution" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Automation_workspaceId_status_idx" ON "Automation"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Automation_createdById_idx" ON "Automation"("createdById");

-- CreateIndex
CREATE INDEX "Automation_triggerType_idx" ON "Automation"("triggerType");

-- CreateIndex
CREATE INDEX "AutomationExecution_workspaceId_idx" ON "AutomationExecution"("workspaceId");

-- CreateIndex
CREATE INDEX "AutomationExecution_status_idx" ON "AutomationExecution"("status");

-- CreateIndex
CREATE INDEX "AutomationExecution_executedAt_idx" ON "AutomationExecution"("executedAt");

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
