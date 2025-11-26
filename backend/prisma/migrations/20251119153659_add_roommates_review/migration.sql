-- CreateEnum
CREATE TYPE "RoommateRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "RoommateRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "requestedId" TEXT NOT NULL,
    "status" "RoommateRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roommate" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Roommate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommateReview" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedId" TEXT NOT NULL,
    "roommateId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoommateRequest_requesterId_idx" ON "RoommateRequest"("requesterId");

-- CreateIndex
CREATE INDEX "RoommateRequest_requestedId_idx" ON "RoommateRequest"("requestedId");

-- CreateIndex
CREATE INDEX "RoommateRequest_status_idx" ON "RoommateRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RoommateRequest_requesterId_requestedId_key" ON "RoommateRequest"("requesterId", "requestedId");

-- CreateIndex
CREATE INDEX "Roommate_user1Id_idx" ON "Roommate"("user1Id");

-- CreateIndex
CREATE INDEX "Roommate_user2Id_idx" ON "Roommate"("user2Id");

-- CreateIndex
CREATE INDEX "Roommate_isActive_idx" ON "Roommate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Roommate_user1Id_user2Id_key" ON "Roommate"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "RoommateReview_reviewedId_idx" ON "RoommateReview"("reviewedId");

-- CreateIndex
CREATE UNIQUE INDEX "RoommateReview_reviewerId_reviewedId_roommateId_key" ON "RoommateReview"("reviewerId", "reviewedId", "roommateId");

-- AddForeignKey
ALTER TABLE "RoommateRequest" ADD CONSTRAINT "RoommateRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateRequest" ADD CONSTRAINT "RoommateRequest_requestedId_fkey" FOREIGN KEY ("requestedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roommate" ADD CONSTRAINT "Roommate_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roommate" ADD CONSTRAINT "Roommate_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateReview" ADD CONSTRAINT "RoommateReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateReview" ADD CONSTRAINT "RoommateReview_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateReview" ADD CONSTRAINT "RoommateReview_roommateId_fkey" FOREIGN KEY ("roommateId") REFERENCES "Roommate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
