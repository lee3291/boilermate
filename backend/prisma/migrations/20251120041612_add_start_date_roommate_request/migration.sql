-- DropIndex
DROP INDEX "Roommate_user1Id_user2Id_key";

-- DropIndex
DROP INDEX "RoommateRequest_requesterId_requestedId_key";

-- AlterTable
ALTER TABLE "RoommateRequest" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Roommate_startDate_idx" ON "Roommate"("startDate");

-- CreateIndex
CREATE INDEX "Roommate_endDate_idx" ON "Roommate"("endDate");

-- CreateIndex
CREATE INDEX "RoommateRequest_createdAt_idx" ON "RoommateRequest"("createdAt");
